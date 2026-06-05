import { AuthError } from '../../../shared/http/errors.js';
import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';
import { EMOTION_FEEDBACK_OPTIONS } from '../constants/emotionFeedback.constants.js';

export class EmotionFeedbackOrchestratorService {
  /**
   * @param {{
   *   emotionFeedbackRepository: import('../repositories/emotionFeedback.repository.js').EmotionFeedbackRepository,
   *   childQueryPort: import('../../../shared/ports/childQuery.port.js').ChildQueryPort,
   *   attemptLookup: (attemptId: number) => Promise<import('@prisma/client').QuizAttempt | null>,
   * }} deps
   */
  constructor(deps) {
    this.emotionFeedbackRepository = deps.emotionFeedbackRepository;
    this.childQueryPort = deps.childQueryPort;
    this.attemptLookup = deps.attemptLookup;
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {{ quizAttemptId: number, emotionLabel: string }} input
   */
  async submitFeedback(auth, input) {
    const childId = await this.#resolveStudentChildId(auth);
    const attempt = await this.attemptLookup(input.quizAttemptId);

    if (!attempt || attempt.childId !== childId) {
      throw new AuthError(403, 'Quiz attempt not found', 'AUTH_FORBIDDEN');
    }

    if (attempt.status !== 'completed') {
      throw new AuthError(400, 'Feedback is only allowed after quiz completion', 'VALIDATION_ERROR');
    }

    const existing = await this.emotionFeedbackRepository.findByAttemptId(input.quizAttemptId);
    if (existing) {
      return this.#mapFeedbackRow(existing);
    }

    const option = EMOTION_FEEDBACK_OPTIONS[input.emotionLabel];
    const row = await this.emotionFeedbackRepository.create({
      childId,
      quizAttemptId: input.quizAttemptId,
      emotionLabel: option.label,
      emotionScore: option.score,
    });

    return this.#mapFeedbackRow(row);
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number} childId
   */
  async listForChild(auth, childId) {
    await this.#assertCanAccessChild(auth, childId);
    const rows = await this.emotionFeedbackRepository.findByChildId(childId);
    return {
      childId,
      latest: rows[0] ? this.#mapFeedbackRow(rows[0]) : null,
      items: rows.map((row) => this.#mapFeedbackRow(row)),
    };
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   */
  async #resolveStudentChildId(auth) {
    if (auth.role !== 'student' || !auth.childId) {
      throw new AuthError(403, 'Student session required', 'AUTH_FORBIDDEN');
    }
    return Number(auth.childId);
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number} childId
   */
  async #assertCanAccessChild(auth, childId) {
    if (auth.role === 'student') {
      if (String(auth.childId) !== String(childId)) {
        throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
      }
      const exists = await this.childQueryPort.existsById(childId);
      if (!exists) {
        throw new AuthError(403, 'Learner profile not found', 'AUTH_FORBIDDEN');
      }
      return;
    }

    if (auth.role === 'parent') {
      const owns = await this.childQueryPort.existsForParent(Number(auth.parentId), childId);
      if (!owns) {
        throw new ParentForbiddenError('You do not have access to this learner profile');
      }
      return;
    }

    throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
  }

  #mapFeedbackRow(row) {
    return {
      id: row.id,
      childId: row.childId,
      quizAttemptId: row.quizAttemptId,
      emotionLabel: row.emotionLabel,
      emotionScore: row.emotionScore,
      createdAt: row.createdAt.toISOString(),
      quizTitle: row.quizAttempt?.quiz?.title ?? null,
      quizId: row.quizAttempt?.quizId ?? null,
    };
  }
}
