import { createApp, startServer } from './app.js';
import { disconnectPrisma } from './shared/db/prisma.js';
import { logAuthRateLimitMode } from './shared/middleware/rateLimit.js';
import { logger } from './shared/utils/logger.js';

const app = createApp();
logAuthRateLimitMode();
const server = startServer(app);

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
