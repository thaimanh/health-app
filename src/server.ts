import app from './app';
import config from './config';
import { logger } from './shared/logger';
import { prismaService } from './libs/prisma';

const startServer = async () => {
  const PORT = config.get('port');

  await prismaService.connect();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    server.close(async () => {
      await prismaService.disconnect(); // Disconnect Prisma from DB
      logger.info('Prisma disconnected from database.');
      process.exit(1);
    });
  });

  // Handle SIGTERM for graceful shutdown in Docker
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully.');
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prismaService.disconnect(); // Disconnect Prisma from DB
      logger.info('Prisma disconnected from database.');
      process.exit(0);
    });
  });

  // Catch uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err.name, err.message, err.stack);
    process.exit(1);
  });
};

startServer();
