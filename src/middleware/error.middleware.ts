import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';

import { BaseError } from '../shared/errors/base.error';
import { logger } from '../shared/logger';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: (err?: any) => any) {
    if (error instanceof BaseError) {
      logger.warn(`Operational Error: ${error.name} - ${error.message}`, {
        name: error.name,
        httpCode: error.httpCode,
        isOperational: error.isOperational,
        stack: error.stack,
      });

      return response.status(error.httpCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }

    // Handle routing-controllers ValidationError (from class-validator)
    if (error.name === 'ValidationError' || error.httpCode === 400) {
      logger.warn({ error }, `Validation Error: ${error.message}`);

      const validationErrors = this.formatValidationErrors(error);

      return response.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(
        {
          code: error.code,
          message: error.meta?.message,
        },
        'Prisma Error:',
      );

      return response.status(400).json({
        success: false,
        message: error.meta?.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.meta?.message,
          code: error.code,
        }),
      });
    }

    // Handle unauthorized errors (common with @Authorized decorator)
    if (error.httpCode === StatusCodes.UNAUTHORIZED) {
      logger.warn(`Unauthorized access attempt: ${request.method} ${request.url}`);

      return response.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized access',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }

    // Handle not found errors (from routing-controllers)
    if (error.httpCode === StatusCodes.NOT_FOUND) {
      return response.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Resource not found',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }

    // Handle all other errors
    logger.error({ error }, `Server Error: ${error.name} - ${error.message}`);

    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  private formatValidationErrors(error: any): any[] {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((err: any) => ({
        property: err.property,
        value: err.value,
        constraints: err.constraints,
      }));
    }

    return [{ message: error.message }];
  }
}
