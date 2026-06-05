import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';

/**
 * @param {ReturnType<import('../ai.module.js').createAiModule>} aiModule
 */
export function createAiRouter(aiModule) {
  const router = Router();
  const { controller } = aiModule;

  router.get(
    '/recommendation/:childId',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.childRecommendation),
  );

  return router;
}
