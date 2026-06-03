import {
  assertItemsMatchChildGrade,
  filterQuizzesForChildGrade,
  isQuizGradeAllowedForChild,
  loadChildGradeEnumForId,
} from '../../../shared/content/gradeCatalogFilter.js';
import { gradeLevelToDisplayLabel } from '../../../shared/content/taxonomy.js';
import { logger } from '../../../shared/utils/logger.js';
import { QuizForbiddenError, QuizNotFoundError } from '../errors/quiz.errors.js';
import { toQuestionDto, toQuizListItemDto, toQuizMetaDto } from '../mappers/quizDto.mapper.js';

export class QuizCatalogService {
  /**
   * @param {import('../repositories/quiz.repository.js').QuizRepository} quizRepository
   * @param {import('../../../shared/ports/childQuery.port.js').ChildQueryPort} childQueryPort
   */
  constructor(quizRepository, childQueryPort) {
    this.quizRepository = quizRepository;
    this.childQueryPort = childQueryPort;
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   */
  async listPublishedQuizzesForAuth(auth) {
    const rows = await this.quizRepository.listPublished();

    if (auth.role === 'parent' || auth.role === 'admin') {
      return rows.map(toQuizListItemDto);
    }

    const childGrade = await this.#resolveStudentGrade(auth);
    const filtered = filterQuizzesForChildGrade(rows, childGrade);
    const scoped = assertItemsMatchChildGrade(filtered, childGrade);

    logger.info('[grade-scope]', {
      endpoint: 'quizCatalog.list',
      childId: auth.childId ?? null,
      childGrade: childGrade ?? null,
      childGradeLabel: gradeLevelToDisplayLabel(childGrade),
      publishedTotal: rows.length,
      returned: scoped.length,
      quizGrades: scoped.map((q) => q.gradeLevel),
    });

    return scoped.map(toQuizListItemDto);
  }

  /**
   * @param {string | number} quizId
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} [auth]
   */
  async getPublishedQuizDetail(quizId, auth = undefined) {
    const quiz = await this.quizRepository.findPublishedById(quizId);
    if (!quiz) {
      throw new QuizNotFoundError();
    }

    await this.#assertStudentCanAccessQuiz(auth, quiz.gradeLevel);

    const questions = quiz.questions.map((question) =>
      toQuestionDto(question, { includeCorrect: false, quiz }),
    );

    return {
      quiz: {
        ...toQuizMetaDto(quiz),
        questionCount: quiz._count?.questions ?? questions.length,
      },
      questions,
    };
  }

  /**
   * @param {string | number} quizId
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} [auth]
   */
  async getQuestionsForAttempt(quizId, auth = undefined) {
    const quiz = await this.quizRepository.findPublishedById(quizId);
    if (!quiz) {
      throw new QuizNotFoundError();
    }

    if (!quiz.questions.length) {
      throw new QuizNotFoundError();
    }

    await this.#assertStudentCanAccessQuiz(auth, quiz.gradeLevel);

    return {
      quiz,
      questionRows: quiz.questions,
      questions: quiz.questions.map((question) => toQuestionDto(question, { quiz })),
    };
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   */
  async #resolveStudentGrade(auth) {
    if (!auth?.childId) {
      return null;
    }
    return loadChildGradeEnumForId(this.childQueryPort, Number(auth.childId));
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext | undefined} auth
   * @param {import('@prisma/client').GradeLevel} quizGradeLevel
   */
  async #assertStudentCanAccessQuiz(auth, quizGradeLevel) {
    if (!auth || auth.role === 'parent' || auth.role === 'admin') {
      return;
    }

    const childGrade = await this.#resolveStudentGrade(auth);
    if (!isQuizGradeAllowedForChild(quizGradeLevel, childGrade)) {
      throw new QuizForbiddenError(
        'This quiz is outside your grade band. Choose a quiz from your catalog list.',
      );
    }
  }
}
