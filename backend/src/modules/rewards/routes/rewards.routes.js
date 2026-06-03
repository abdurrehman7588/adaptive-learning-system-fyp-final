import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import { validateChildIdParam } from '../validators/rewards.validators.js';

/**
 * Mounted at /api/children — register BEFORE child CRUD router.
 * @param {ReturnType<import('../rewards.module.js').createRewardsModule>} rewardsModule
 */
export function createRewardsRouter(rewardsModule) {
  const router = Router();
  const { controller } = rewardsModule;

  router.get(
    '/rewards/overview',
    authenticate,
    authorize('parent'),
    asyncHandler(controller.parentRewardsOverview),
  );

  router.get(
    '/:childId/rewards',
    authenticate,
    authorize('parent', 'student'),
    validateChildIdParam,
    asyncHandler(controller.childRewards),
  );

  return router;
}
