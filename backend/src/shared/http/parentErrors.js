import { AppError } from './errors.js';

export class ParentError extends AppError {
  constructor(statusCode, message, code = 'PARENT_ERROR') {
    super(statusCode, message, code);
    this.name = 'ParentError';
  }
}

export class ParentForbiddenError extends ParentError {
  constructor(message = 'Access denied') {
    super(403, message, 'PARENT_FORBIDDEN');
  }
}

export class ParentValidationError extends ParentError {
  constructor(message = 'Validation failed', errors = []) {
    super(422, message, 'PARENT_VALIDATION_ERROR', errors);
  }
}
