import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import {
  validateChildIdParam,
  validateSubmitBody,
} from '../validators/emotionFeedback.validators.js';

/**
 * @param {ReturnType<import('../emotionFeedback.module.js').createEmotionFeedbackModule>} module
 */
export function createEmotionFeedbackRouter(module) {
  const router = Router();
  const { controller } = module;

  router.post(
    '/',
    authenticate,
    authorize('student'),
    asyncHandler(async (req, res) => {
      req.validated = validateSubmitBody(req.body);
      return controller.submit(req, res);
    }),
  );

  router.get(
    '/:childId',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(async (req, res) => {
      validateChildIdParam(req.params);
      return controller.listByChild(req, res);
    }),
  );

  return router;
}
