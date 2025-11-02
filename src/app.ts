import express from 'express';
import apiRoutes from './api';
import { errorHandlerMiddleware, securityMiddleware } from './middleware';
import { httpLogger } from './shared/logger';

function createApp() {
  const app = express();

  // Security Middlewares
  app.use(securityMiddleware);

  // Error Handling Middleware
  app.use(errorHandlerMiddleware);

  // HttpLogger
  app.use(httpLogger);

  // API Routes
  app.use(apiRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  return app;
}

const app = createApp();

export default app;
