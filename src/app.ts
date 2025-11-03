import express from 'express';
import apiRoutes from './api';
import { errorHandlerMiddleware, securityMiddleware } from './middleware';

function createApp() {
  const app = express();

  // Security Middlewares
  securityMiddleware(app);

  // API Routes
  app.use(apiRoutes);

  // Error Handling Middlewares
  app.use(errorHandlerMiddleware);

  return app;
}

const app = createApp();

export default app;
