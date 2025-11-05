import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

class PrismaService {
  public prisma: PrismaClient;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.prisma = this.createPrismaClient();
    } else {
      if (!globalThis.prisma) {
        globalThis.prisma = this.createPrismaClient();
      }
      this.prisma = globalThis.prisma;
    }
  }

  private createPrismaClient(): PrismaClient {
    return new PrismaClient();
  }

  /**
   * Real database health check using Prisma
   */
  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.prisma.$runCommandRaw({
        ping: 1,
      });

      return true;
    } catch (error) {
      logger.error('Database health check failed: ' + error, error);
      return false;
    }
  }

  /**
   * Enhanced connect with real health check
   */
  public async connect(): Promise<void> {
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Connecting to database (attempt ${attempt}/${maxRetries})...`);

        await this.prisma.$connect();
        logger.debug('Prisma client connected, performing health check...');

        const isHealthy = await this.checkDatabaseHealth();

        if (isHealthy) {
          logger.info('Successfully connected and verified database health via Prisma.');
          return;
        } else {
          logger.warn(`Database health check failed on attempt ${attempt}`);

          // Disconnect before retry
          await this.prisma.$disconnect();

          if (attempt < maxRetries) {
            logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
            await this.delay(retryDelay);
          }
        }
      } catch (err) {
        logger.error(`Connection attempt ${attempt} failed:`);

        if (attempt < maxRetries) {
          logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
          await this.delay(retryDelay);
        } else {
          logger.error('All connection attempts failed');
          process.exit(1);
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Disconnects from the database via PrismaClient.
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Disconnected from the database via Prisma.');
    } catch (err) {
      logger.error('Failed to disconnect from the database via Prisma:', err);
    }
  }
}

const prismaService = new PrismaService();
export default prismaService;
