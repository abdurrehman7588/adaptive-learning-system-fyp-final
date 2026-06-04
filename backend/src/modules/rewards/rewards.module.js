import { RewardsAttemptRepository } from './repositories/rewardsAttempt.repository.js';
import { RewardsOrchestratorService } from './services/rewardsOrchestrator.service.js';
import { RewardsController } from './controllers/rewards.controller.js';

/**
 * @param {{
 *   childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort,
 *   emotionalOrchestrator?: import('../emotional/services/emotionalOrchestrator.service.js').EmotionalOrchestratorService,
 * }} deps
 */
export function createRewardsModule(deps) {
  const rewardsAttemptRepository = new RewardsAttemptRepository();
  const orchestrator = new RewardsOrchestratorService({
    rewardsAttemptRepository,
    childQueryPort: deps.childQueryPort,
    emotionalOrchestrator: deps.emotionalOrchestrator ?? null,
  });
  const controller = new RewardsController(orchestrator);

  return {
    controller,
    orchestrator,
  };
}
