import { AttemptAnalyticsRepository } from '../analytics/repositories/attemptAnalytics.repository.js';
import { EmotionalRepository } from '../emotional/repositories/emotional.repository.js';
import { AiController } from './controllers/ai.controller.js';
import { AiOrchestratorService } from './services/aiOrchestrator.service.js';
import { RecommendationPredictionService } from './services/recommendationPrediction.service.js';

/**
 * @param {{
 *   childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort,
 *   emotionalRepository?: import('../emotional/repositories/emotional.repository.js').EmotionalRepository,
 *   emotionFeedbackRepository?: import('../emotion-feedback/repositories/emotionFeedback.repository.js').EmotionFeedbackRepository,
 *   attemptAnalyticsRepository?: import('../analytics/repositories/attemptAnalytics.repository.js').AttemptAnalyticsRepository,
 * }} deps
 */
export function createAiModule(deps) {
  const attemptAnalyticsRepository =
    deps.attemptAnalyticsRepository ?? new AttemptAnalyticsRepository();
  const emotionalRepository = deps.emotionalRepository ?? new EmotionalRepository();
  const emotionFeedbackRepository = deps.emotionFeedbackRepository ?? null;

  const recommendationPredictionService = new RecommendationPredictionService({
    attemptAnalyticsRepository,
    emotionalRepository,
    emotionFeedbackRepository,
  });

  const orchestrator = new AiOrchestratorService({
    childQueryPort: deps.childQueryPort,
    recommendationPredictionService,
  });

  const controller = new AiController(orchestrator);

  return {
    controller,
    orchestrator,
    recommendationPredictionService,
    attemptAnalyticsRepository,
    emotionalRepository,
  };
}
