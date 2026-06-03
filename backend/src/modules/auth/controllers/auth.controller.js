import { sendSuccess } from '../../../shared/http/envelope.js';
import { config } from '../../../config/index.js';
import { isGoogleOAuthConfigured } from '../../../config/index.js';

export class AuthController {
  /**
   * @param {{
   *   authService: import('../services/auth.service.js').AuthService,
   *   studentAuthService: import('../services/studentAuth.service.js').StudentAuthService,
   * }} deps
   */
  constructor({ authService, studentAuthService }) {
    this.authService = authService;
    this.studentAuthService = studentAuthService;
  }

  register = async (req, res) => {
    const result = await this.authService.registerParent(req.validated);
    return sendSuccess(res, result, 'User registered successfully', 201);
  };

  login = async (req, res) => {
    const result = await this.authService.loginParent(req.validated);
    return sendSuccess(res, result, 'Login successful');
  };

  adminLogin = async (req, res) => {
    const result = await this.authService.loginAdmin(req.validated);
    return sendSuccess(res, result, 'Login successful');
  };

  studentLogin = async (req, res) => {
    const result = await this.studentAuthService.loginStudent(req.validated);
    return sendSuccess(res, result, 'Login successful');
  };

  me = async (req, res) => {
    const result = await this.authService.getCurrentUser(req.auth);
    return sendSuccess(res, result, 'Profile loaded');
  };

  updateProfile = async (req, res) => {
    const result = await this.authService.updateParentProfileName(
      req.auth.parentId ?? req.auth.userId,
      req.validated.name,
    );
    return sendSuccess(res, result, 'Profile updated');
  };

  googleStart = async (req, res) => {
    if (!isGoogleOAuthConfigured()) {
      return res.redirect(
        `${config.frontendUrl}/parent/login?error=google_not_configured`,
      );
    }
    const url = this.authService.getGoogleAuthorizationUrl();
    return res.redirect(url);
  };

  googleCallback = async (req, res) => {
    try {
      const { code, state } = req.query;
      if (!code || typeof code !== 'string') {
        return res.redirect(`${config.frontendUrl}/parent/login?error=oauth_denied`);
      }

      const result = await this.authService.completeGoogleOAuth(
        code,
        typeof state === 'string' ? state : '',
      );

      const redirectUrl = new URL(`${config.frontendUrl}/parent/login`);
      redirectUrl.searchParams.set('token', result.token);
      return res.redirect(redirectUrl.toString());
    } catch {
      return res.redirect(`${config.frontendUrl}/parent/login?error=oauth_failed`);
    }
  };
}
