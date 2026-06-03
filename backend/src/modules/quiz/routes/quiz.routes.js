import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import { quizValidators } from '../validators/quiz.validators.js';

function withValidation(validator, handler) {
  return asyncHandler(async (req, res) => {
    req.validated = validator(req.body);
    return handler(req, res);
  });
}

/**
 * @param {ReturnType<import('../quiz.module.js').createQuizModule>} quizModule
 */
export function createQuizRouter(quizModule) {
  const router = Router();
  const { controller } = quizModule;

  router.get(
    '/',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.list),
  );

  router.get(
    '/:quizId',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.getById),
  );

  router.post(
    '/:quizId/attempts',
    authenticate,
    authorize('parent', 'student'),
    withValidation(quizValidators.startAttempt, controller.startAttempt),
  );

  return router;
}

/**
 * Attempt routes mounted at /api/attempts (frontend contract).
 * @param {ReturnType<import('../quiz.module.js').createQuizModule>} quizModule
 */
export function createAttemptRouter(quizModule) {
  const router = Router();
  const { controller } = quizModule;

  router.get(
    '/:attemptId',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.getAttempt),
  );

  router.post(
    '/:attemptId/submit',
    authenticate,
    authorize('parent', 'student'),
    withValidation(quizValidators.submitAttempt, controller.submitAttempt),
  );

  return router;
}
