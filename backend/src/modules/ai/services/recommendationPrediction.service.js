import { buildAdaptiveFeatures } from '../../adaptive/adaptiveScore.service.js';
import { resolveEmotionalSignal } from '../../emotion-feedback/services/emotionalSignal.service.js';
import { buildStudentFeatures, mergeAdaptiveFeatures } from './studentFeatures.service.js';
import { predictRecommendationLevel } from './mlPrediction.service.js';
import { logger } from '../../../shared/utils/logger.js';

export class RecommendationPredictionService {
  /**
   * @param {{
   *   attemptAnalyticsRepository: import('../../analytics/repositories/attemptAnalytics.repository.js').AttemptAnalyticsRepository,
   *   emotionalRepository: import('../../emotional/repositories/emotional.repository.js').EmotionalRepository,
   *   emotionFeedbackRepository?: import('../../emotion-feedback/repositories/emotionFeedback.repository.js').EmotionFeedbackRepository | null,
   * }} deps
   */
  constructor(deps) {
    this.attemptAnalyticsRepository = deps.attemptAnalyticsRepository;
    this.emotionalRepository = deps.emotionalRepository;
    this.emotionFeedbackRepository = deps.emotionFeedbackRepository ?? null;
  }

  /**
   * @param {number} childId
   * @param {import('@prisma/client').QuizAttempt[] | null} [attempts]
   */
  async predictForChild(childId, attempts = null) {
    const resolvedAttempts =
      attempts ?? (await this.attemptAnalyticsRepository.findAttemptsForChild(childId));
    const emotionalSignal = await this.resolveEmotionalSignal(childId);
    const mlFeatures = buildStudentFeatures(resolvedAttempts, emotionalSignal);
    const adaptiveFeatures = buildAdaptiveFeatures(resolvedAttempts, emotionalSignal);
    const features = mergeAdaptiveFeatures(mlFeatures, adaptiveFeatures);
    const prediction = await predictRecommendationLevel(features, childId, adaptiveFeatures);
    return {
      ...prediction,
      emotionalSignal,
    };
  }

  /**
   * Priority: quiz feedback → SDQ assessment → neutral default.
   *
   * @param {number} childId
   */
  async resolveEmotionalSignal(childId) {
    if (!this.emotionFeedbackRepository) {
      return this.#resolveLegacyEmotionalScore(childId);
    }

    try {
      return await resolveEmotionalSignal(childId, {
        emotionalRepository: this.emotionalRepository,
        emotionFeedbackRepository: this.emotionFeedbackRepository,
      });
    } catch (error) {
      logger.debug('[ml-recommendation] emotional signal resolver failed', {
        childId,
        error: error instanceof Error ? error.message : String(error),
      });
      return this.#resolveLegacyEmotionalScore(childId);
    }
  }

  /**
   * @param {number} childId
   */
  async #resolveLegacyEmotionalScore(childId) {
    try {
      const latest = await this.emotionalRepository.findLatestAssessment(childId);
      if (latest?.overallPercent !== null && latest?.overallPercent !== undefined) {
        return {
          score: Number(latest.overallPercent),
          assessed: true,
          source: 'sdq_assessment',
          label: null,
          assessmentAt: latest.completedAt,
        };
      }
    } catch (error) {
      logger.debug('[ml-recommendation] emotional score unavailable', {
        childId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      score: null,
      assessed: false,
      source: 'neutral_default',
      label: null,
    };
  }
}
