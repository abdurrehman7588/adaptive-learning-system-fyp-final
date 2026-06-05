import { AttemptAnalyticsRepository } from './repositories/attemptAnalytics.repository.js';
import { AnalyticsOrchestratorService } from './services/analyticsOrchestrator.service.js';
import { AnalyticsController } from './controllers/analytics.controller.js';

/**
 * @param {{
 *   childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort,
 *   recommendationPredictionService?: import('../ai/services/recommendationPrediction.service.js').RecommendationPredictionService | null,
 * }} deps
 */
export function createAnalyticsModule(deps) {
  const attemptAnalyticsRepository = new AttemptAnalyticsRepository();
  const orchestrator = new AnalyticsOrchestratorService({
    attemptAnalyticsRepository,
    childQueryPort: deps.childQueryPort,
    recommendationPredictionService: deps.recommendationPredictionService ?? null,
  });
  const controller = new AnalyticsController(orchestrator);

  return {
    controller,
    orchestrator,
  };
}
