import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { jsonSyntaxErrorHandler } from './shared/middleware/jsonSyntaxError.js';
import { notFoundHandler } from './shared/middleware/notFound.js';
import { createHealthRouter } from './modules/health/routes/health.routes.js';
import { createAuthRouter } from './modules/auth/index.js';
import { createParentModule, createParentRouter } from './modules/parent/index.js';
import { createChildModule, createChildRouter } from './modules/child/index.js';
import {
  createQuizModule,
  createQuizRouter,
  createAttemptRouter,
} from './modules/quiz/index.js';
import { createAnalyticsModule, createAnalyticsRouter } from './modules/analytics/index.js';
import { createRewardsModule, createRewardsRouter } from './modules/rewards/index.js';
import { createEmotionalModule, createEmotionalRouter } from './modules/emotional/index.js';
import { ParentUserReadAdapter } from './modules/auth/adapters/parentUserRead.adapter.js';
import { logger } from './shared/utils/logger.js';

/**
 * Application composition root — wires cross-module ports once.
 * @param {{ childQueryPort?: object, childAuthPort?: object }} [options]
 */
export function createApp(options = {}) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(jsonSyntaxErrorHandler);
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Adaptive Learning API',
      data: { docs: '/api/health' },
    });
  });

  const childModule = createChildModule();
  const childQueryPort = options.childQueryPort ?? childModule.childQueryPort;
  const childAuthPort = options.childAuthPort ?? childModule.childAuthPort;
  const parentUserReadPort = new ParentUserReadAdapter();

  const parentModule = createParentModule({ childQueryPort, parentUserReadPort });
  const quizModule = createQuizModule({ childQueryPort });
  const analyticsModule = createAnalyticsModule({ childQueryPort });
  const emotionalModule = createEmotionalModule({ childQueryPort });
  const rewardsModule = createRewardsModule({
    childQueryPort,
    emotionalOrchestrator: emotionalModule.orchestrator,
  });

  app.use('/api/health', createHealthRouter());
  app.use('/api/parent', createParentRouter(parentModule));
  app.use(
    '/api/auth',
    createAuthRouter({
      childQueryPort,
      childAuthPort,
      parentProfilePort: parentModule.parentProfilePort,
    }),
  );
  app.use('/api/children', createAnalyticsRouter(analyticsModule));
  app.use('/api/children', createEmotionalRouter(emotionalModule));
  app.use('/api/children', createRewardsRouter(rewardsModule));
  app.use('/api/children', createChildRouter(childModule));
  app.use('/api/quizzes', createQuizRouter(quizModule));
  app.use('/api/attempts', createAttemptRouter(quizModule));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function startServer(app) {
  return app.listen(config.port, () => {
    logger.info(`API listening on http://localhost:${config.port}`);
  });
}
