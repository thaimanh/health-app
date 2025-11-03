// utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../../shared/logger';

const logger = createLogger({ module: 'AsyncHandler' });

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    Promise.resolve(fn(req, res, next))
      .then(() => {
        const duration = Date.now() - startTime;
        logger.debug(`Request completed`, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        });
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        logger.error(`Request failed`, {
          method: req.method,
          url: req.url,
          error: error.message,
          duration: `${duration}ms`,
        });
        next(error);
      });
  };
};
