export class AppError extends Error {
  constructor(statusCode, message, code = 'APP_ERROR', errors = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(422, message, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(statusCode, message, code = 'AUTH_UNAUTHORIZED', errors = []) {
    super(statusCode, message, code, errors);
    this.name = 'AuthError';
  }
}
