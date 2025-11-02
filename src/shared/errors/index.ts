import { BaseError } from '../../shared/errors/base.error';
import { StatusCodes } from 'http-status-codes';

export class BadRequestError extends BaseError {
  constructor(description: string = 'Bad Request') {
    super('BAD_REQUEST', StatusCodes.BAD_REQUEST, description, true);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(description: string = 'Unauthorized') {
    super('UNAUTHORIZED', StatusCodes.UNAUTHORIZED, description, true);
  }
}

export class ForbiddenError extends BaseError {
  constructor(description: string = 'Forbidden') {
    super('FORBIDDEN', StatusCodes.FORBIDDEN, description, true);
  }
}

export class NotFoundError extends BaseError {
  constructor(description: string = 'Resource not found') {
    super('NOT_FOUND', StatusCodes.NOT_FOUND, description, true);
  }
}

export class ConflictError extends BaseError {
  constructor(description: string = 'Resource conflict') {
    super('CONFLICT', StatusCodes.CONFLICT, description, true);
  }
}

export class ValidationError extends BaseError {
  constructor(description: string = 'Validation failed') {
    super('VALIDATION_ERROR', StatusCodes.UNPROCESSABLE_ENTITY, description, true);
  }
}

export class InternalServerError extends BaseError {
  constructor(description: string = 'Internal Server Error') {
    super('INTERNAL_SERVER_ERROR', StatusCodes.INTERNAL_SERVER_ERROR, description, false);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(service: string, description: string = 'External service unavailable') {
    super('EXTERNAL_SERVICE_ERROR', StatusCodes.BAD_GATEWAY, `${service}: ${description}`, true);
  }
}
