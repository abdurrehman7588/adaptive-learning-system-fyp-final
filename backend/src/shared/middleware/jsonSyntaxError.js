import { sendError } from '../http/envelope.js';

/**
 * Turn body-parser JSON syntax failures into JSON envelopes (avoids empty 400 bodies).
 */
export function jsonSyntaxErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Invalid JSON in request body', 'INVALID_JSON');
  }

  return next(err);
}
