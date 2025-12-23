export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}