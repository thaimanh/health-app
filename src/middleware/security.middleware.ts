import { Request, Response, NextFunction, json, urlencoded, Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { logger } from '../shared/logger';
import config from '../config';

export const SecurityMiddleware = (app: Express) => {
  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(helmet());

  // Limit API requests to prevent brute-force and DDoS attacks
  const apiLimiter = rateLimit({
    max: config.get('rateLimit.maxRequests'),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after some time.',
    handler: (req: Request, res: Response, _next: NextFunction) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
  });
  app.use(apiLimiter);

  // Enable CORS for all routes
  app.use(cors());

  // Compress all responses
  app.use(compression());

  // Parse JSON and URL-encoded bodies
  app.use(json({ limit: '10kb' })); // Limit JSON payload size
  app.use(urlencoded({ extended: true, limit: '10kb' })); // Limit URL-encoded payload size
};
