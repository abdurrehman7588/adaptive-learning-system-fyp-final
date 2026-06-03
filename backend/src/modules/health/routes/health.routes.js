import { Router } from 'express';
import { sendSuccess } from '../../../shared/http/envelope.js';

export function createHealthRouter() {
  const router = Router();

  router.get('/', (_req, res) => {
    return sendSuccess(
      res,
      {
        ok: true,
        version: 'auth-v1',
        timingPersistence: false,
      },
      'OK',
    );
  });

  return router;
}
