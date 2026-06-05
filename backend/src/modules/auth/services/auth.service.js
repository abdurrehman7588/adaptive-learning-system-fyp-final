import bcrypt from 'bcryptjs';
import { AuthError } from '../../../shared/http/errors.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenService } from './token.service.js';
import { GoogleOAuthService } from './googleOAuth.service.js';
import {
  mapAdminUserDto,
  mapParentUserDto,
  mapStudentUserDto,
} from '../mappers/userDto.mapper.js';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  /**
   * @param {{
   *   userRepository?: UserRepository,
   *   tokenService?: TokenService,
   *   googleOAuthService?: GoogleOAuthService,
   *   childQueryPort?: import('../ports/childQuery.port.js').ChildQueryPort,
   *   parentProfilePort?: import('../../../shared/ports/parentProfile.port.js').ParentProfilePort,
   * }} [deps]
   */
  constructor(deps = {}) {
    this.userRepository = deps.userRepository ?? new UserRepository();
    this.tokenService = deps.tokenService ?? new TokenService();
    this.googleOAuthService = deps.googleOAuthService ?? new GoogleOAuthService();
    this.childQueryPort = deps.childQueryPort;
    this.parentProfilePort = deps.parentProfilePort;
  }

  async ensureParentProfile(userId) {
    if (this.parentProfilePort) {
      await this.parentProfilePort.ensureProfileExists(Number(userId));
    }
  }

  async registerParent({ name, email, password, role }) {
    if (role !== 'parent') {
      throw new AuthError(422, 'Only parent registration is supported', 'AUTH_VALIDATION_ERROR');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AuthError(409, 'User already exists', 'AUTH_EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepository.createParent({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    await this.ensureParentProfile(user.id);
    return this.buildParentAuthResponse(user);
  }

  async loginParent({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.role !== 'parent' || !user.passwordHash) {
      throw new AuthError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    await this.ensureParentProfile(user.id);
    return this.buildParentAuthResponse(user);
  }

  async loginAdmin({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.role !== 'admin' || !user.passwordHash) {
      throw new AuthError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError(401, 'Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    const token = this.tokenService.signAccessToken(
      this.tokenService.buildAdminClaims(user),
    );

    return { token, user: mapAdminUserDto(user) };
  }

  getGoogleAuthorizationUrl() {
    return this.googleOAuthService.createAuthorizationUrl();
  }

  async completeGoogleOAuth(code, state) {
    if (!this.googleOAuthService.validateState(state)) {
      throw new AuthError(400, 'Invalid OAuth state', 'AUTH_OAUTH_FAILED');
    }

    const profile = await this.googleOAuthService.exchangeCode(code);
    const user = await this.userRepository.upsertParentFromGoogle(profile);
    await this.ensureParentProfile(user.id);
    return this.buildParentAuthResponse(user);
  }

  async getCurrentUser(auth) {
    if (auth.role === 'student') {
      const childId = Number(auth.childId ?? auth.userId);
      if (!Number.isInteger(childId) || childId <= 0) {
        throw new AuthError(401, 'Invalid student session', 'AUTH_UNAUTHORIZED');
      }

      if (!this.childQueryPort) {
        throw new AuthError(
          503,
          'Learner profile service unavailable',
          'AUTH_UNAVAILABLE',
        );
      }

      const child = await this.childQueryPort.findById(childId);
      if (!child) {
        throw new AuthError(401, 'Learner profile not found', 'AUTH_UNAUTHORIZED');
      }

      return {
        user: mapStudentUserDto({
          childId: child.id,
          name: child.name,
          gradeLevel: child.gradeLevelEnum ?? child.gradeLevel,
          avatarUrl: child.avatarUrl,
          parentId: null,
          age: undefined,
        }),
      };
    }

    const user = await this.userRepository.findById(auth.userId);
    if (!user) {
      throw new AuthError(401, 'User not found', 'AUTH_UNAUTHORIZED');
    }

    if (user.role === 'admin') {
      return { user: mapAdminUserDto(user) };
    }

    const childIds = this.childQueryPort
      ? await this.childQueryPort.listChildIds(user.id)
      : [];

    return { user: mapParentUserDto(user, childIds) };
  }

  async updateParentProfileName(parentId, name) {
    const user = await this.userRepository.updateParentProfile(parentId, { name });
    const childIds = this.childQueryPort
      ? await this.childQueryPort.listChildIds(user.id)
      : [];
    return { user: mapParentUserDto(user, childIds) };
  }

  async buildParentAuthResponse(user) {
    const token = this.tokenService.signAccessToken(
      this.tokenService.buildParentClaims(user),
    );
    const childIds = this.childQueryPort
      ? await this.childQueryPort.listChildIds(user.id)
      : [];

    return {
      token,
      user: mapParentUserDto(user, childIds),
    };
  }
}
