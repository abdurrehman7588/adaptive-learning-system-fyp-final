import { AttemptAnalyticsRepository } from './repositories/attemptAnalytics.repository.js';
import { AnalyticsOrchestratorService } from './services/analyticsOrchestrator.service.js';
import { AnalyticsController } from './controllers/analytics.controller.js';

/**
 * @param {{ childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort }} deps
 */
export function createAnalyticsModule(deps) {
  const attemptAnalyticsRepository = new AttemptAnalyticsRepository();
  const orchestrator = new AnalyticsOrchestratorService({
    attemptAnalyticsRepository,
    childQueryPort: deps.childQueryPort,
  });
  const controller = new AnalyticsController(orchestrator);

  return {
    controller,
    orchestrator,
  };
}
