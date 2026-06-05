import { AuthError } from '../../../shared/http/errors.js';
import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';
import {
  assertItemsMatchChildGrade,
  filterQuizzesForChildGrade,
  loadChildGradeEnumForId,
  resolveChildGradeEnum,
} from '../../../shared/content/gradeCatalogFilter.js';
import { gradeLevelToDisplayLabel } from '../../../shared/content/taxonomy.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  buildChildAnalytics,
  buildParentAnalyticsOverview,
} from './childAnalytics.service.js';
import { buildChildRecommendations } from './recommendation.service.js';

export class AnalyticsOrchestratorService {
  /**
   * @param {{
   *   attemptAnalyticsRepository: import('../repositories/attemptAnalytics.repository.js').AttemptAnalyticsRepository,
   *   childQueryPort: import('../../../shared/ports/childQuery.port.js').ChildQueryPort,
   *   recommendationPredictionService?: import('../../ai/services/recommendationPrediction.service.js').RecommendationPredictionService | null,
   * }} deps
   */
  constructor(deps) {
    this.repository = deps.attemptAnalyticsRepository;
    this.childQueryPort = deps.childQueryPort;
    this.recommendationPredictionService = deps.recommendationPredictionService ?? null;
  }

  async assertParentOwnsChild(parentId, childId) {
    const owns = await this.childQueryPort.existsForParent(
      Number(parentId),
      Number(childId),
    );
    if (!owns) {
      throw new ParentForbiddenError('You do not have access to this learner profile');
    }
  }

  async assertCanAccessChild(auth, childId) {
    if (auth.role === 'student') {
      if (String(auth.childId) !== String(childId)) {
        throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
      }
      const exists = await this.childQueryPort.existsById(Number(childId));
      if (!exists) {
        throw new AuthError(403, 'Learner profile not found', 'AUTH_FORBIDDEN');
      }
      return;
    }

    if (auth.role === 'parent') {
      await this.assertParentOwnsChild(auth.parentId, childId);
      return;
    }

    throw new AuthError(403, 'Access denied', 'AUTH_FORBIDDEN');
  }

  async getParentAnalyticsOverview(parentId) {
    const children = await this.childQueryPort.listByParentId(Number(parentId));
    const attempts = await this.repository.findAttemptsForParentChildren(parentId);

    const attemptsByChild = new Map();
    for (const attempt of attempts) {
      const list = attemptsByChild.get(attempt.childId) ?? [];
      list.push(attempt);
      attemptsByChild.set(attempt.childId, list);
    }

    const childrenRows = children.map((child) => ({
      id: child.id,
      name: child.name,
      gradeLevel: child.gradeLevel ?? null,
      attempts: attemptsByChild.get(child.id) ?? [],
    }));

    return buildParentAnalyticsOverview(childrenRows);
  }

  async getChildAnalyticsBundle(auth, childId) {
    const effectiveChildId = this.#resolveEffectiveChildId(auth, childId);
    await this.assertCanAccessChild(auth, effectiveChildId);

    const childSummary = await this.#resolveChildSummary(auth, effectiveChildId);
    const attempts = await this.repository.findAttemptsForChild(effectiveChildId);

    return {
      child: childSummary,
      analytics: buildChildAnalytics(attempts),
    };
  }

  async getParentRecommendationsOverview(parentId) {
    const children = await this.childQueryPort.listByParentId(Number(parentId));
    const allQuizzes = await this.repository.listPublishedQuizzes();

    const childrenWithAttempts = await Promise.all(
      children.map(async (child) => {
        const attempts = await this.repository.findAttemptsForChild(child.id);
        const childGrade = await loadChildGradeEnumForId(this.childQueryPort, child.id);
        const quizzes = filterQuizzesForChildGrade(allQuizzes, childGrade);
        const tierPrediction = await this.#resolveTierPrediction(child.id, attempts);
        const bundle = buildChildRecommendations(
          {
            id: child.id,
            name: child.name,
            gradeLevel: childGrade,
            attempts,
          },
          quizzes,
          { tierPrediction },
        );
        bundle.recommendations = assertItemsMatchChildGrade(
          bundle.recommendations,
          childGrade,
        );
        this.#logGradeScope('parentRecommendationsOverview', child.id, childGrade, {
          quizzes: quizzes.length,
          recommendations: bundle.recommendations.length,
        });
        return bundle;
      }),
    );

    return { children: childrenWithAttempts };
  }

  async getChildRecommendationsBundle(auth, childId) {
    const effectiveChildId = this.#resolveEffectiveChildId(auth, childId);
    await this.assertCanAccessChild(auth, effectiveChildId);

    const childSummary = await this.#resolveChildSummary(auth, effectiveChildId);
    const attempts = await this.repository.findAttemptsForChild(effectiveChildId);
    const allQuizzes = await this.repository.listPublishedQuizzes();
    const childGrade = await loadChildGradeEnumForId(
      this.childQueryPort,
      effectiveChildId,
    );
    const quizzes = filterQuizzesForChildGrade(allQuizzes, childGrade);

    const tierPrediction = await this.#resolveTierPrediction(effectiveChildId, attempts);

    const bundle = buildChildRecommendations(
      {
        id: childSummary.id,
        name: childSummary.name,
        gradeLevel: childGrade,
        attempts,
      },
      quizzes,
      { tierPrediction },
    );

    bundle.recommendations = assertItemsMatchChildGrade(
      bundle.recommendations,
      childGrade,
    );

    this.#logGradeScope('childRecommendations', effectiveChildId, childGrade, {
      quizzes: quizzes.length,
      recommendations: bundle.recommendations.length,
      quizGrades: quizzes.map((q) => q.gradeLevel),
      recommendationGrades: bundle.recommendations.map((r) => r.gradeLevel),
    });

    return {
      child: {
        id: bundle.id,
        name: bundle.name,
        gradeLevel: childGrade,
        gradeLevelLabel: gradeLevelToDisplayLabel(childGrade),
      },
      subjectProfile: bundle.subjectProfile,
      learningProfile: bundle.learningProfile,
      adaptiveInsights: bundle.adaptiveInsights,
      conceptProfile: bundle.conceptProfile,
      recommendations: bundle.recommendations,
    };
  }

  /**
   * @param {number} childId
   * @param {import('@prisma/client').QuizAttempt[]} attempts
   */
  async #resolveTierPrediction(childId, attempts) {
    if (!this.recommendationPredictionService) return null;
    try {
      return await this.recommendationPredictionService.predictForChild(childId, attempts);
    } catch (error) {
      logger.warn('[ml-recommendation] tier prediction failed in analytics bundle', {
        childId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Student sessions always use JWT childId — never a URL param that could drift.
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number} childId
   */
  #resolveEffectiveChildId(auth, childId) {
    if (auth.role === 'student') {
      return Number(auth.childId);
    }
    return Number(childId);
  }

  /**
   * @param {string} endpoint
   * @param {number} childId
   * @param {import('@prisma/client').GradeLevel | null} childGrade
   * @param {{ quizzes: number, recommendations: number, quizGrades?: string[], recommendationGrades?: string[] }} counts
   */
  #logGradeScope(endpoint, childId, childGrade, counts) {
    logger.info('[grade-scope]', {
      endpoint,
      childId,
      childGrade: childGrade ?? null,
      childGradeLabel: gradeLevelToDisplayLabel(childGrade),
      ...counts,
    });
  }

  async #resolveChildSummary(auth, childId) {
    if (auth.role === 'parent') {
      const children = await this.childQueryPort.listByParentId(Number(auth.parentId));
      const child = children.find((row) => row.id === Number(childId));
      if (!child) {
        throw new ParentForbiddenError('Learner profile not found');
      }
      return {
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevelEnum ?? child.gradeLevel ?? null,
        gradeLevelEnum: child.gradeLevelEnum ?? null,
      };
    }

    const child = await this.childQueryPort.findById(Number(childId));
    if (!child) {
      throw new AuthError(403, 'Learner profile not found', 'AUTH_FORBIDDEN');
    }

    return {
      id: child.id,
      name: child.name,
      gradeLevel: child.gradeLevelEnum ?? child.gradeLevel ?? null,
      gradeLevelEnum: child.gradeLevelEnum ?? null,
    };
  }
}
