import 'reflect-metadata';

import express from 'express';
import { useExpressServer } from 'routing-controllers';

import { SecurityMiddleware } from './middleware';
import { ErrorHandlerMiddleware } from './middleware/error.middleware';
import { authorizationChecker } from './service/auth/authorizationChecker';
import { currentUserChecker } from './service/auth/currentUserChecker';

function createApp() {
  const app = express();

  // Security Middlewares
  SecurityMiddleware(app);

  // Configure routing-controllers
  useExpressServer(app, {
    controllers: [__dirname + '/api/**/*.controller.{ts,js}'],
    middlewares: [ErrorHandlerMiddleware],
    interceptors: [__dirname + '/interceptor/**/*.{js,ts}'],
    authorizationChecker: authorizationChecker,
    currentUserChecker: currentUserChecker,
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
