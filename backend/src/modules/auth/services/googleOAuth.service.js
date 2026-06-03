import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { config, isGoogleOAuthConfigured } from '../../../config/index.js';
import { AuthError } from '../../../shared/http/errors.js';

const oauthStates = new Map();

function pruneExpiredStates() {
  const now = Date.now();
  for (const [key, value] of oauthStates.entries()) {
    if (value.expiresAt < now) oauthStates.delete(key);
  }
}

export class GoogleOAuthService {
  constructor() {
    this.client = isGoogleOAuthConfigured()
      ? new OAuth2Client(
          config.google.clientId,
          config.google.clientSecret,
          config.google.callbackUrl,
        )
      : null;
  }

  assertConfigured() {
    if (!this.client) {
      throw new AuthError(
        503,
        'Google OAuth is not configured on this server',
        'AUTH_OAUTH_FAILED',
      );
    }
  }

  createAuthorizationUrl() {
    this.assertConfigured();
    pruneExpiredStates();

    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, { expiresAt: Date.now() + 10 * 60 * 1000 });

    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
      state,
    });
  }

  validateState(state) {
    if (!state) return false;
    pruneExpiredStates();
    const entry = oauthStates.get(state);
    if (!entry) return false;
    oauthStates.delete(state);
    return entry.expiresAt >= Date.now();
  }

  async exchangeCode(code) {
    this.assertConfigured();
    try {
      const { tokens } = await this.client.getToken(code);
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.google.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new Error('Incomplete Google profile');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        avatarUrl: payload.picture ?? null,
      };
    } catch (error) {
      throw new AuthError(
        502,
        'Google sign-in failed. Please try again.',
        'AUTH_OAUTH_FAILED',
      );
    }
  }
}
