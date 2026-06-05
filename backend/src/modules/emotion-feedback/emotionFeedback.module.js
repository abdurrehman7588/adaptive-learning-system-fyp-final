import { prisma } from '../../shared/db/prisma.js';
import { EmotionFeedbackRepository } from './repositories/emotionFeedback.repository.js';
import { EmotionFeedbackOrchestratorService } from './services/emotionFeedbackOrchestrator.service.js';
import { EmotionFeedbackController } from './controllers/emotionFeedback.controller.js';

/**
 * @param {{
 *   childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort,
 * }} deps
 */
export function createEmotionFeedbackModule(deps) {
  const emotionFeedbackRepository = new EmotionFeedbackRepository();

  const orchestrator = new EmotionFeedbackOrchestratorService({
    emotionFeedbackRepository,
    childQueryPort: deps.childQueryPort,
    attemptLookup: (attemptId) =>
      prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        select: {
          id: true,
          childId: true,
          status: true,
          quizId: true,
          completedAt: true,
        },
      }),
  });

  const controller = new EmotionFeedbackController(orchestrator);

  return {
    controller,
    orchestrator,
    emotionFeedbackRepository,
  };
}
