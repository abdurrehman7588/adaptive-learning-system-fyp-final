import { signJwt, verifyJwt } from '../../../shared/auth/jwt.js';
import { AuthError } from '../../../shared/http/errors.js';

export class TokenService {
  signAccessToken(payload) {
    return signJwt(payload);
  }

  verifyAccessToken(token) {
    try {
      return verifyJwt(token);
    } catch {
      throw new AuthError(401, 'Invalid or expired token', 'AUTH_UNAUTHORIZED');
    }
  }

  buildParentClaims(user) {
    return {
      sub: String(user.id),
      role: 'parent',
      parentId: String(user.id),
      email: user.email,
    };
  }

  buildStudentClaims(identity) {
    return {
      sub: String(identity.childId),
      role: 'student',
      childId: String(identity.childId),
    };
  }

  buildAdminClaims(user) {
    return {
      sub: String(user.id),
      role: 'admin',
      email: user.email,
    };
  }
}
