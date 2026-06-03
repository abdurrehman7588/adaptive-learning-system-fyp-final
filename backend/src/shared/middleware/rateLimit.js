import rateLimit from 'express-rate-limit';
import { config } from '../../config/index.js';
import { logger } from '../utils/logger.js';

const rateLimitMessage = {
  success: false,
  message: 'Too many authentication attempts. Please try again later.',
  data: { code: 'RATE_LIMITED', errors: [] },
};

function isAuthRateLimitDisabled() {
  if (config.isProduction) {
    return false;
  }

  const flag = process.env.DISABLE_AUTH_RATE_LIMIT?.trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes') {
    return true;
  }

  // Development default: do not rate-limit credential endpoints (local iteration).
  return true;
}

/**
 * No-op middleware preserving route wiring in development.
 */
function authRateLimitPassthrough(_req, _res, next) {
  next();
}

/**
 * Credential endpoints only (login/register). GET /auth/me is never rate-limited.
 */
function createProductionAuthCredentialRateLimiter() {
  const windowMs = Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? String(15 * 60 * 1000), 10);
  const max = Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? '30', 10);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  });
}

const productionLimiter = createProductionAuthCredentialRateLimiter();

export const authCredentialRateLimiter = isAuthRateLimitDisabled()
  ? authRateLimitPassthrough
  : productionLimiter;

export function logAuthRateLimitMode() {
  if (isAuthRateLimitDisabled()) {
    logger.info('Auth rate limiting: DISABLED (development)');
    return;
  }

  const windowMs = Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? String(15 * 60 * 1000), 10);
  const max = Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? '30', 10);
  logger.info(`Auth rate limiting: ENABLED (max ${max} per ${Math.round(windowMs / 60000)} min)`);
}
