import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import {
  validateActivitySlug,
  validateAssessmentBody,
  validateChildIdParam,
  validateFeelingsActivity,
  validateScenarioActivity,
} from '../validators/emotional.validators.js';
import { EI_ACTIVITIES } from '../constants/eiCatalog.js';

function withAssessmentValidation(handler) {
  return asyncHandler(async (req, res) => {
    req.validated = validateAssessmentBody(req.body);
    return handler(req, res);
  });
}

function withActivityValidation(handler) {
  return asyncHandler(async (req, res) => {
    req.activitySlug = validateActivitySlug(req.params);
    const activity = EI_ACTIVITIES[req.activitySlug];
    req.validated =
      activity.type === 'feelings_journal'
        ? validateFeelingsActivity(req.body)
        : validateScenarioActivity(req.body);
    return handler(req, res);
  });
}

/**
 * Mounted at /api/children — register BEFORE generic child CRUD routes.
 * @param {ReturnType<import('../emotional.module.js').createEmotionalModule>} emotionalModule
 */
export function createEmotionalRouter(emotionalModule) {
  const router = Router();
  const { controller } = emotionalModule;

  router.get(
    '/me/emotional-profile',
    authenticate,
    authorize('student'),
    asyncHandler(controller.studentProfile),
  );

  router.get(
    '/me/emotional-history',
    authenticate,
    authorize('student'),
    asyncHandler(controller.studentHistory),
  );

  router.post(
    '/me/emotional-assessment',
    authenticate,
    authorize('student'),
    withAssessmentValidation(controller.studentSubmitAssessment),
  );

  router.post(
    '/me/emotional-activities/:slug/complete',
    authenticate,
    authorize('student'),
    withActivityValidation(controller.studentCompleteActivity),
  );

  router.get(
    '/:childId/emotional-profile',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(async (req, res, next) => {
      validateChildIdParam(req.params);
      return controller.childProfile(req, res, next);
    }),
  );

  return router;
}
