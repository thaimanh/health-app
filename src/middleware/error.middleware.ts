import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../shared/errors/base.error';
import { logger } from '../shared/logger';
import { StatusCodes } from 'http-status-codes';

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
    logger.warn(`Validation Error: ${err.message}`, { error: err });
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  logger.error(`Server Error: ${err.name} - ${err.message}`, { error: err });

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
