import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

/**
 * Framework-agnostic JWT helpers (shared kernel).
 * Auth TokenService adds role-specific claim builders on top.
 */

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    ...options,
  });
}

export function verifyJwt(token) {
  return jwt.verify(token, config.jwt.secret);
}
