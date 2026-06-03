import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import { parentValidators } from '../validators/parent.validators.js';

function withValidation(validator, handler) {
  return asyncHandler(async (req, res) => {
    req.validated = validator(req.body);
    return handler(req, res);
  });
}

/**
 * @param {ReturnType<import('../parent.module.js').createParentModule>} parentModule
 */
export function createParentRouter(parentModule) {
  const router = Router();
  const { controller } = parentModule;

  router.use(authenticate, authorize('parent'));

  router.get('/me', asyncHandler(controller.getMe));

  router.put(
    '/me/preferences',
    withValidation(parentValidators.updatePreferences, controller.updatePreferences),
  );

  router.get('/onboarding', asyncHandler(controller.getOnboarding));

  router.put(
    '/onboarding',
    withValidation(parentValidators.updateOnboarding, controller.updateOnboarding),
  );

  router.get('/bootstrap', asyncHandler(controller.getBootstrap));

  return router;
}
