// middleware/error-handler.middleware.ts
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';

import { BaseError } from '../shared/errors/base.error';
import { logger } from '../shared/logger';

interface ValidationError {
  property?: string;
  value?: any;
  constraints?: Record<string, string>;
  message?: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  details?: any;
  stack?: string;
}

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  error(error: any, request: Request, response: Response, next: (err?: any) => any) {
    if (error instanceof BaseError) {
      this.handleBaseError(error, request, response);
      return;
    }

    if (this.isValidationError(error)) {
      this.handleValidationError(error, request, response);
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.handlePrismaError(error, response);
      return;
    }

    if (this.isHttpError(error)) {
      this.handleHttpError(error, request, response);
      return;
    }

    this.handleGenericError(error, request, response);
  }

  private handleBaseError(error: BaseError, request: Request, response: Response): void {
    logger.warn(`Operational Error: ${error.name} - ${error.message}`, {
      name: error.name,
      httpCode: error.httpCode,
      isOperational: error.isOperational,
      stack: error.stack,
    });

    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message,
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(error.httpCode).json(errorResponse);
  }

  private handleValidationError(error: any, request: Request, response: Response): void {
    logger.warn(`Validation Error: ${error.message}`, { error });

    const validationErrors = this.formatValidationErrors(error);

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError, response: Response): void {
    logger.error(
      {
        code: error.code,
        meta: error.meta,
      },
      `Prisma Error: ${error.message}`,
    );

    const errorResponse: ErrorResponse = {
      success: false,
      message: this.getPrismaErrorMessage(error),
    };

    if (this.isDevelopment) {
      errorResponse.details = {
        code: error.code,
        meta: error.meta,
      };
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  private handleHttpError(error: any, request: Request, response: Response): void {
    const httpCode = error.httpCode || StatusCodes.INTERNAL_SERVER_ERROR;

    const errorHandlers: {
      [key: number]: (error: any, request: Request, response: Response) => void;
    } = {
      [StatusCodes.UNAUTHORIZED]: this.handleUnauthorizedError.bind(this),
      [StatusCodes.FORBIDDEN]: this.handleForbiddenError.bind(this),
      [StatusCodes.NOT_FOUND]: this.handleNotFoundError.bind(this),
    };

    const handler = errorHandlers[httpCode] || this.handleGenericHttpError.bind(this);
    handler(error, request, response);
  }

  private handleUnauthorizedError(error: any, request: Request, response: Response): void {
    logger.warn(`Unauthorized access attempt: ${request.method} ${request.url}`);

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Unauthorized access',
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }

  private handleForbiddenError(error: any, request: Request, response: Response): void {
    logger.warn(`Access is denied for request on ${request.method} ${request.url}`);

    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message || 'Access denied',
    };

    if (this.isDevelopment) {
      errorResponse.details = {
        name: error.name,
        method: request.method,
        path: request.url,
      };
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.FORBIDDEN).json(errorResponse);
  }

  private handleNotFoundError(error: any, request: Request, response: Response): void {
    logger.warn(`Resource not found on ${request.method} ${request.url}`);

    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message || 'Resource not found',
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.NOT_FOUND).json(errorResponse);
  }

  private handleGenericHttpError(error: any, request: Request, response: Response): void {
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message || 'Request failed',
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(error.httpCode).json(errorResponse);
  }

  private handleGenericError(error: any, request: Request, response: Response): void {
    logger.error(
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      `Unhandled Error: ${request.method} ${request.url}`,
    );

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Internal Server Error',
    };

    if (this.isDevelopment) {
      errorResponse.stack = error.stack;
    }

    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  // Helper methods for error type detection
  private isValidationError(error: any): boolean {
    return error.name === 'ValidationError' || error.httpCode === StatusCodes.BAD_REQUEST;
  }

  private isHttpError(error: any): boolean {
    return error.httpCode && typeof error.httpCode === 'number';
  }

  private formatValidationErrors(error: any): ValidationError[] {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((err: any) => ({
        property: err.property,
        value: err.value,
        constraints: err.constraints,
      }));
    }

    return [{ message: error.message }];
  }

  private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const errorMessages: { [key: string]: string } = {
      P2002: 'A record with this value already exists',
      P2025: 'Record not found',
      P2003: 'Foreign key constraint failed',
      P2014: 'Invalid relationship',
    };

    return (
      errorMessages[error.code] || error.meta?.message?.toString() || 'Database operation failed'
    );
  }
}
