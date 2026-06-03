import { QuizRepository } from './repositories/quiz.repository.js';
import { QuizAttemptRepository } from './repositories/quizAttempt.repository.js';
import { QuizCatalogService } from './services/quizCatalog.service.js';
import { QuizAttemptService } from './services/quizAttempt.service.js';
import { QuizOwnershipService } from './services/quizOwnership.service.js';
import { QuizController } from './controllers/quiz.controller.js';

/**
 * @param {{ childQueryPort: import('../../shared/ports/childQuery.port.js').ChildQueryPort }} deps
 */
export function createQuizModule(deps) {
  const quizRepository = new QuizRepository();
  const quizAttemptRepository = new QuizAttemptRepository();

  const quizCatalogService = new QuizCatalogService(quizRepository, deps.childQueryPort);
  const quizOwnershipService = new QuizOwnershipService(deps.childQueryPort);
  const quizAttemptService = new QuizAttemptService({
    quizCatalogService,
    quizAttemptRepository,
    quizOwnershipService,
  });

  const controller = new QuizController({
    quizCatalogService,
    quizAttemptService,
  });

  return {
    controller,
    quizCatalogService,
    quizAttemptService,
  };
}
