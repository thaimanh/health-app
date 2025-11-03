import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../shared/errors/base.error';
import { logger } from '../shared/logger';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';

// Centralized error handling middleware for Express
export const errorHandlerMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof BaseError) {
    logger.warn(`Operational Error: ${err.name} - ${err.message}`, {
      name: err.name,
      httpCode: err.httpCode,
      isOperational: err.isOperational,
      stack: err.stack,
    });

    return res.status(err.httpCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else if (err.name === 'ValidationError') {
    logger.warn({ error: err }, `Validation Error: ${err.message}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(
      {
        code: err.code,
        message: err.meta?.message,
      },
      'Prisma Error:',
    );

    // Return generic error to client
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      ...(process.env.NODE_ENV === 'development' && { stack: err.meta?.message }),
    });
  }

  logger.error({ error: err }, `Server Error: ${err.name} - ${err.message}`);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
