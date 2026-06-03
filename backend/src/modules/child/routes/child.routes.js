import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { authenticate } from '../../../shared/middleware/authenticate.js';
import { authorize } from '../../../shared/middleware/authorize.js';
import { childValidators } from '../validators/child.validators.js';

function withValidation(validator, handler) {
  return asyncHandler(async (req, res) => {
    req.validated = validator(req.body);
    return handler(req, res);
  });
}

/**
 * @param {ReturnType<import('../child.module.js').createChildModule>} childModule
 */
export function createChildRouter(childModule) {
  const router = Router();
  const { controller } = childModule;

  router.get(
    '/',
    authenticate,
    authorize('parent'),
    asyncHandler(controller.list),
  );

  router.post(
    '/',
    authenticate,
    authorize('parent'),
    withValidation(childValidators.create, controller.create),
  );

  router.get(
    '/me/profile',
    authenticate,
    authorize('student'),
    asyncHandler(controller.studentProfile),
  );

  router.patch(
    '/me',
    authenticate,
    authorize('student'),
    withValidation(childValidators.studentAvatar, controller.updateStudentSelf),
  );

  router.get(
    '/:id',
    authenticate,
    authorize('parent', 'student'),
    asyncHandler(controller.getById),
  );

  router.put(
    '/:id',
    authenticate,
    authorize('parent'),
    withValidation(childValidators.update, controller.update),
  );

  router.delete(
    '/:id',
    authenticate,
    authorize('parent'),
    asyncHandler(controller.remove),
  );

  return router;
}
