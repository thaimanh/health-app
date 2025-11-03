// utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/logger';
import { Prisma } from '@prisma/client';

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    Promise.resolve(fn(req, res, next))
      .then(() => {
        logger.info(
          `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - startTime}ms`,
        );
      })
      .catch((error) => {
        next(error);
      });
  };
};
