import { AppError } from '../../../shared/http/errors.js';

export class ChildValidationError extends AppError {
  constructor(message, errors = []) {
    super(422, message, 'CHILD_VALIDATION_ERROR', errors);
    this.name = 'ChildValidationError';
  }
}

export class ChildNotFoundError extends AppError {
  constructor(message = 'Learner profile not found') {
    super(404, message, 'CHILD_NOT_FOUND');
    this.name = 'ChildNotFoundError';
  }
}

export class ChildForbiddenError extends AppError {
  constructor(message = 'You do not have access to this learner profile') {
    super(403, message, 'CHILD_FORBIDDEN');
    this.name = 'ChildForbiddenError';
  }
}

export class ChildConflictError extends AppError {
  constructor(message = 'Username is already taken') {
    super(409, message, 'CHILD_USERNAME_TAKEN');
    this.name = 'ChildConflictError';
  }
}

export class ChildLimitError extends AppError {
  constructor(message = 'Maximum number of learner profiles reached') {
    super(400, message, 'CHILD_LIMIT_REACHED');
    this.name = 'ChildLimitError';
  }
}
