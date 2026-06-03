import { RewardsAttemptRepository } from './repositories/rewardsAttempt.repository.js';
import { RewardsOrchestratorService } from './services/rewardsOrchestrator.service.js';
import { RewardsController } from './controllers/rewards.controller.js';

/**
 * @param {{ childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort }} deps
 */
export function createRewardsModule(deps) {
  const rewardsAttemptRepository = new RewardsAttemptRepository();
  const orchestrator = new RewardsOrchestratorService({
    rewardsAttemptRepository,
    childQueryPort: deps.childQueryPort,
  });
  const controller = new RewardsController(orchestrator);

  return {
    controller,
    orchestrator,
  };
}
