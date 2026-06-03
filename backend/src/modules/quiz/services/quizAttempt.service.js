import { ValidationError } from '../../../shared/http/errors.js';
import { AttemptConflictError, AttemptNotFoundError } from '../errors/quiz.errors.js';
import { toAttemptDto, toQuestionDto } from '../mappers/quizDto.mapper.js';
import { gradeQuizAttempt } from './quizScoring.service.js';

export class QuizAttemptService {
  /**
   * @param {{
   *   quizCatalogService: import('./quizCatalog.service.js').QuizCatalogService,
   *   quizAttemptRepository: import('../repositories/quizAttempt.repository.js').QuizAttemptRepository,
   *   quizOwnershipService: import('./quizOwnership.service.js').QuizOwnershipService,
   * }} deps
   */
  constructor(deps) {
    this.quizCatalogService = deps.quizCatalogService;
    this.quizAttemptRepository = deps.quizAttemptRepository;
    this.quizOwnershipService = deps.quizOwnershipService;
  }

  async startAttempt(auth, quizId, bodyChildId) {
    const childId = await this.quizOwnershipService.resolveChildId(auth, bodyChildId);
    const { quiz, questions } = await this.quizCatalogService.getQuestionsForAttempt(
      quizId,
      auth,
    );

    const attempt = await this.quizAttemptRepository.createInProgress({
      quizId: quiz.id,
      childId,
    });

    return {
      attempt: toAttemptDto(attempt),
      questions,
    };
  }

  async _loadQuizQuestionRows(quizId, auth) {
    const { quiz, questionRows } = await this.quizCatalogService.getQuestionsForAttempt(
      quizId,
      auth,
    );
    return { quiz, questionRows };
  }

  async submitAttempt(auth, attemptId, answers) {
    const attempt = await this.quizAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AttemptNotFoundError();
    }

    await this.quizOwnershipService.assertCanAccessAttempt(auth, attempt);

    if (attempt.status !== 'in_progress') {
      throw new AttemptConflictError();
    }

    const { quiz, questionRows } = await this._loadQuizQuestionRows(attempt.quizId, auth);

    if (answers.length !== questionRows.length) {
      throw new ValidationError('All questions must be answered', [
        {
          field: 'answers',
          message: `Expected ${questionRows.length} answers, received ${answers.length}`,
        },
      ]);
    }

    for (const answer of answers) {
      const question = questionRows.find((row) => row.id === Number(answer.question_id));
      if (!question) {
        throw new ValidationError('Invalid question in submission', [
          { field: 'answers', message: `Unknown question_id ${answer.question_id}` },
        ]);
      }

      if (answer.selected_option_id !== null) {
        const option = question.options.find(
          (row) => row.id === Number(answer.selected_option_id),
        );
        if (!option) {
          throw new ValidationError('Invalid option in submission', [
            {
              field: 'answers',
              message: `Option ${answer.selected_option_id} is not valid for question ${answer.question_id}`,
            },
          ]);
        }
      }
    }

    const grading = gradeQuizAttempt(questionRows, answers, quiz.passPercentage ?? 60);

    await this.quizAttemptRepository.replaceAnswers(attempt.id, grading.gradedRows);
    const completed = await this.quizAttemptRepository.completeAttempt(attempt.id, {
      score: grading.score,
      totalPoints: grading.totalPoints,
      percentage: grading.percentage,
      passed: grading.passed,
    });

    return {
      attempt: toAttemptDto(completed, grading.answerDtos),
    };
  }

  async getAttemptResult(auth, attemptId) {
    const attempt = await this.quizAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AttemptNotFoundError();
    }

    await this.quizOwnershipService.assertCanAccessAttempt(auth, attempt);

    const answerDtos = attempt.answers.map((row) => ({
      question_id: row.questionId,
      selected_option_id: row.selectedOptionId,
      is_correct: row.isCorrect,
    }));

    return {
      attempt: toAttemptDto(attempt, answerDtos),
    };
  }
}
