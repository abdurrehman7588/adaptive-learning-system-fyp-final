import { sendError } from '../http/envelope.js';

export function notFoundHandler(req, res) {
  return sendError(res, 404, `Route not found: ${req.method} ${req.path}`, 'NOT_FOUND');
}
