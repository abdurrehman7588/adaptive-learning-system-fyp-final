import { AuthError } from '../../../shared/http/errors.js';
import { ParentForbiddenError } from '../../../shared/http/parentErrors.js';

export class AiOrchestratorService {
  /**
   * @param {{
   *   childQueryPort: import('../../../shared/ports/childQuery.port.js').ChildQueryPort,
   *   recommendationPredictionService: import('../services/recommendationPrediction.service.js').RecommendationPredictionService,
   * }} deps
   */
  constructor(deps) {
    this.childQueryPort = deps.childQueryPort;
    this.recommendationPredictionService = deps.recommendationPredictionService;
  }

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number} childId
   */
  async getChildRecommendation(auth, childId) {
    const effectiveChildId = this.#resolveEffectiveChildId(auth, childId);
    await this.assertCanAccessChild(auth, effectiveChildId);

    const prediction = await this.recommendationPredictionService.predictForChild(
      effectiveChildId,
    );

    return {
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      source: prediction.source,
      adaptiveScore: prediction.adaptiveProfile?.adaptiveScore ?? null,
      learnerLevel: prediction.adaptiveProfile?.learnerLevel ?? null,
      recommendedDifficulty: prediction.adaptiveProfile?.recommendedDifficulty ?? null,
      nextLearningPath: prediction.adaptiveProfile?.nextLearningPath ?? null,
      blend: prediction.adaptiveProfile?.blend ?? null,
      features: prediction.features ?? null,
    };
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

  /**
   * @param {import('../../../shared/middleware/authenticate.js').AuthContext} auth
   * @param {number} childId
   */
  #resolveEffectiveChildId(auth, childId) {
    if (auth.role === 'student') {
      return Number(auth.childId);
    }
    return Number(childId);
  }
}
