import 'reflect-metadata';

import express from 'express';
import { useExpressServer } from 'routing-controllers';

import { SecurityMiddleware } from './middleware';
import { ErrorHandlerMiddleware } from './middleware/error.middleware';

function createApp() {
  const app = express();

  // Security Middlewares
  SecurityMiddleware(app);

  // Configure routing-controllers
  useExpressServer(app, {
    controllers: [__dirname + '/api/**/*.controller.{ts,js}'],
    middlewares: [ErrorHandlerMiddleware],
    defaultErrorHandler: false,
    routePrefix: '/api/v1',
    validation: {
      whitelist: true, // Remove properties not defined in decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      forbidUnknownValues: true,
    },
    classTransformer: true,
  });

  return app;
}

const app = createApp();
export default app;
