import { sendSuccess } from '../../../shared/http/envelope.js';

export class QuizController {
  /**
   * @param {{
   *   quizCatalogService: import('../services/quizCatalog.service.js').QuizCatalogService,
   *   quizAttemptService: import('../services/quizAttempt.service.js').QuizAttemptService,
   * }} deps
   */
  constructor(deps) {
    this.quizCatalogService = deps.quizCatalogService;
    this.quizAttemptService = deps.quizAttemptService;
  }

  list = async (req, res) => {
    const quizzes = await this.quizCatalogService.listPublishedQuizzesForAuth(req.auth);
    return sendSuccess(res, { quizzes }, 'Quizzes loaded');
  };

  getById = async (req, res) => {
    const payload = await this.quizCatalogService.getPublishedQuizDetail(
      req.params.quizId,
      req.auth,
    );
    return sendSuccess(res, payload, 'Quiz loaded');
  };

  startAttempt = async (req, res) => {
    const payload = await this.quizAttemptService.startAttempt(
      req.auth,
      req.params.quizId,
      req.validated.child_id,
    );
    return sendSuccess(res, payload, 'Attempt started', 201);
  };

  getAttempt = async (req, res) => {
    const payload = await this.quizAttemptService.getAttemptResult(
      req.auth,
      req.params.attemptId,
    );
    return sendSuccess(res, payload, 'Attempt loaded');
  };

  submitAttempt = async (req, res) => {
    const payload = await this.quizAttemptService.submitAttempt(
      req.auth,
      req.params.attemptId,
      req.validated.answers,
    );
    return sendSuccess(res, payload, 'Attempt submitted');
  };
}
