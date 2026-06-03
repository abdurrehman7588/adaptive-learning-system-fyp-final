import { AppError } from '../../../shared/http/errors.js';

export class QuizNotFoundError extends AppError {
  constructor() {
    super(404, 'Quiz not found', 'QUIZ_NOT_FOUND');
    this.name = 'QuizNotFoundError';
  }
}

export class QuizForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(403, message, 'QUIZ_FORBIDDEN');
    this.name = 'QuizForbiddenError';
  }
}

export class AttemptNotFoundError extends AppError {
  constructor() {
    super(404, 'Attempt not found', 'ATTEMPT_NOT_FOUND');
    this.name = 'AttemptNotFoundError';
  }
}

export class AttemptForbiddenError extends AppError {
  constructor() {
    super(403, 'You cannot access this attempt', 'ATTEMPT_FORBIDDEN');
    this.name = 'AttemptForbiddenError';
  }
}

export class AttemptConflictError extends AppError {
  constructor(message = 'This attempt has already been submitted') {
    super(409, message, 'ATTEMPT_ALREADY_SUBMITTED');
    this.name = 'AttemptConflictError';
  }
}
