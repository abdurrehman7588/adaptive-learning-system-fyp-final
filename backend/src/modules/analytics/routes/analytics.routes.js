import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';

/**
 * Mounted at /api/children — register BEFORE child CRUD router so static paths match.
 * @param {ReturnType<import('../analytics.module.js').createAnalyticsModule>} analyticsModule
 */
export function createAnalyticsRouter(analyticsModule) {
  const router = Router();
  const { controller } = analyticsModule;

  router.get(
    '/analytics/overview',
    authenticate,
    authorize('parent'),
    asyncHandler(controller.parentAnalyticsOverview),
  );

  router.get(
    '/recommendations/overview',
    authenticate,
    authorize('parent'),
    asyncHandler(controller.parentRecommendationsOverview),
  );

  router.get(
    '/me/recommendations',
    authenticate,
    authorize('student'),
    asyncHandler(controller.studentRecommendations),
  );

  router.get(
    '/:childId/analytics',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.childAnalytics),
  );

  router.get(
    '/:childId/recommendations',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.childRecommendations),
  );

  return router;
}
