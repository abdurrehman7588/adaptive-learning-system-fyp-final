import { AppError } from '../http/errors.js';
import { sendError } from '../http/envelope.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code, err.errors);
  }

  logger.error('Unhandled error', {
    path: req.path,
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
  });

  return sendError(res, 500, 'Server error', 'INTERNAL_ERROR');
}
