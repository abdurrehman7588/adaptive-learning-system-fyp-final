import { AuthError } from '../../../shared/http/errors.js';
import { TokenService } from './token.service.js';
import { mapStudentUserDto } from '../mappers/userDto.mapper.js';

export class StudentAuthService {
  /**
   * @param {{ childAuthPort: import('../ports/childAuth.port.js').ChildAuthPort, tokenService: TokenService }} deps
   */
  constructor({ childAuthPort, tokenService }) {
    this.childAuthPort = childAuthPort;
    this.tokenService = tokenService;
  }

  async loginStudent({ username, pin }) {
    const identity = await this.childAuthPort.verifyUsernamePin(
      username.trim().toLowerCase(),
      pin,
    );

    if (!identity) {
      throw new AuthError(
        401,
        'Invalid username or PIN',
        'AUTH_INVALID_CREDENTIALS',
      );
    }

    const token = this.tokenService.signAccessToken(
      this.tokenService.buildStudentClaims(identity),
    );

    return {
      token,
      user: mapStudentUserDto(identity),
    };
  }
}
