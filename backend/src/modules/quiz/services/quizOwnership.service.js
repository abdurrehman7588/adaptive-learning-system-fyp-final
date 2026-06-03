import { ValidationError } from '../../../shared/http/errors.js';
import { QuizForbiddenError } from '../errors/quiz.errors.js';

export class QuizOwnershipService {
  /**
   * @param {import('../../../shared/ports/childQuery.port.js').ChildQueryPort} childQueryPort
   */
  constructor(childQueryPort) {
    this.childQueryPort = childQueryPort;
  }

  /**
   * Resolves the child id for quiz attempts from JWT + optional body.
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number | undefined} bodyChildId
   */
  async resolveChildId(auth, bodyChildId) {
    if (auth.role === 'student') {
      const childId = Number(auth.childId);
      if (!Number.isInteger(childId) || childId <= 0) {
        throw new QuizForbiddenError('Student session is missing child identity');
      }

      if (bodyChildId !== undefined && Number(bodyChildId) !== childId) {
        throw new QuizForbiddenError('child_id does not match your account');
      }

      const exists = await this.childQueryPort.existsById(childId);
      if (!exists) {
        throw new QuizForbiddenError('Learner profile not found');
      }

      return childId;
    }

    if (auth.role === 'parent') {
      const childId = Number(bodyChildId);
      if (!Number.isInteger(childId) || childId <= 0) {
        throw new ValidationError('child_id is required', [
          { field: 'child_id', message: 'Valid child_id is required' },
        ]);
      }

      const parentId = Number(auth.parentId);
      const allowed = await this.childQueryPort.existsForParent(parentId, childId);
      if (!allowed) {
        throw new QuizForbiddenError('This child does not belong to your account');
      }

      return childId;
    }

    throw new QuizForbiddenError();
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {{ childId: number }} attempt
   */
  async assertCanAccessAttempt(auth, attempt) {
    if (auth.role === 'student') {
      if (String(auth.childId) !== String(attempt.childId)) {
        throw new QuizForbiddenError('You cannot access this attempt');
      }
      return;
    }

    if (auth.role === 'parent') {
      const allowed = await this.childQueryPort.existsForParent(
        Number(auth.parentId),
        attempt.childId,
      );
      if (!allowed) {
        throw new QuizForbiddenError('You cannot access this attempt');
      }
      return;
    }

    throw new QuizForbiddenError();
  }
}
