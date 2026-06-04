import { EmotionalRepository } from './repositories/emotional.repository.js';
import { EmotionalOrchestratorService } from './services/emotionalOrchestrator.service.js';
import { EmotionalController } from './controllers/emotional.controller.js';

/**
 * @param {{ childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort }} deps
 */
export function createEmotionalModule(deps) {
  const emotionalRepository = new EmotionalRepository();
  const orchestrator = new EmotionalOrchestratorService({
    emotionalRepository,
    childQueryPort: deps.childQueryPort,
  });
  const controller = new EmotionalController(orchestrator);

  return {
    controller,
    orchestrator,
    emotionalRepository,
  };
}
