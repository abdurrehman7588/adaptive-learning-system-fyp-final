import { AuthError } from '../http/errors.js';
import { verifyJwt } from '../auth/jwt.js';

/**
 * @typedef {Object} AuthContext
 * @property {string} userId
 * @property {'parent' | 'student' | 'admin'} role
 * @property {string} [parentId]
 * @property {string} [childId]
 * @property {string} [email]
 */

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AuthError(401, 'Authentication required', 'AUTH_UNAUTHORIZED');
    }

    const token = header.slice(7).trim();
    const claims = verifyJwt(token);

    /** @type {AuthContext} */
    const auth = {
      userId: String(claims.sub),
      role: claims.role,
      email: claims.email,
    };

    if (claims.role === 'parent' || claims.role === 'admin') {
      auth.parentId = claims.parentId ? String(claims.parentId) : String(claims.sub);
    }

    if (claims.role === 'student' && claims.childId) {
      auth.childId = String(claims.childId);
    }

    req.auth = auth;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      return next(error);
    }
    return next(new AuthError(401, 'Invalid or expired token', 'AUTH_UNAUTHORIZED'));
  }
}
