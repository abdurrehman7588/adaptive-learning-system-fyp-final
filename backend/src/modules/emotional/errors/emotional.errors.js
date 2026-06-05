import { AppError } from '../../../shared/http/errors.js';

export class EmotionalSchemaNotReadyError extends AppError {
  constructor(
    message = 'Emotional intelligence is not available yet. Run database migrations (prisma migrate deploy) on the production database.',
  ) {
    super(503, message, 'EI_SCHEMA_UNAVAILABLE');
    this.name = 'EmotionalSchemaNotReadyError';
  }
}
