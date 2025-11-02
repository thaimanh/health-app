import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

class PrismaService {
  public prisma: PrismaClient;

  constructor() {
    // Implement singleton logic for development environments
    if (process.env.NODE_ENV === 'production') {
      this.prisma = this.createPrismaClient();
    } else {
      if (!globalThis.prisma) {
        globalThis.prisma = this.createPrismaClient();
      }
      this.prisma = globalThis.prisma;
    }

    this.setupPrismaLogging();
  }

  private createPrismaClient(): PrismaClient {
    return new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
    });
  }

  private setupPrismaLogging(): void {
    (this.prisma as any).$on('warn', (e: any) => logger.warn('Prisma WARN:', e));
    (this.prisma as any).$on('error', (e: any) => logger.error('Prisma ERROR:', e));
    (this.prisma as any).$on('info', (e: any) => logger.info('Prisma INFO:', e));
    (this.prisma as any).$on('query', (e: any) => logger.debug('Prisma QUERY:', e.query, e.params));
  }

  /**
   * Connects to the database via PrismaClient.
   * Handles connection success and failure.
   */
  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      await prismaService.prisma.$runCommandRaw({
        ping: 1,
      });
      logger.info('Successfully connected to the database via Prisma.');
    } catch (err) {
      logger.error('Failed to connect to the database via Prisma:', err);
      process.exit(1);
    }
  }

  /**
   * Disconnects from the database via PrismaClient.
   * Useful for graceful shutdowns.
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Disconnected from the database via Prisma.');
    } catch (err) {
      logger.error('Failed to disconnect from the database via Prisma:', err);
      // Don't exit here, just log the error during disconnect
    }
  }
}

// Export a single instance of PrismaService
// This makes sure you always import the same service instance
export const prismaService = new PrismaService();
