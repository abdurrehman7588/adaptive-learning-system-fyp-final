import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import { authCredentialRateLimiter } from '../../../shared/middleware/rateLimit.js';
import { authValidators } from '../validators/auth.validators.js';
import { createAuthModule } from '../auth.module.js';

function withValidation(validator, handler) {
  return asyncHandler(async (req, res) => {
    req.validated = validator(req.body);
    return handler(req, res);
  });
}

/**
 * @param {Parameters<typeof import('../auth.module.js').createAuthModule>[0]} [deps]
 */
export function createAuthRouter(deps) {
  const router = Router();
  const { controller } = createAuthModule(deps);

  router.get('/google', asyncHandler(controller.googleStart));
  router.get('/google/callback', asyncHandler(controller.googleCallback));

  router.post(
    '/register',
    authCredentialRateLimiter,
    withValidation(authValidators.registerParent, controller.register),
  );

  router.post(
    '/login',
    authCredentialRateLimiter,
    withValidation(authValidators.loginParent, controller.login),
  );

  router.post(
    '/student/login',
    authCredentialRateLimiter,
    withValidation(authValidators.loginStudent, controller.studentLogin),
  );

  router.post(
    '/admin/login',
    authCredentialRateLimiter,
    withValidation(authValidators.loginAdmin, controller.adminLogin),
  );

  router.get('/me', authenticate, asyncHandler(controller.me));

  router.put(
    '/profile',
    authenticate,
    authorize('parent'),
    withValidation(authValidators.updateProfile, controller.updateProfile),
  );

  return router;
}
