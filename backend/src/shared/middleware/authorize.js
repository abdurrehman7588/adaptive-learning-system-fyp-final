import { AuthError } from '../http/errors.js';

/**
 * @param  {...('parent' | 'student' | 'admin')} allowedRoles
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new AuthError(401, 'Authentication required', 'AUTH_UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN'));
    }

    return next();
  };
}
