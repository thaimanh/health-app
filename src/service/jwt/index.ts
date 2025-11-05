import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { UnauthorizedError } from '../../shared/errors';
import config from '../../config';
import { logger } from '../../shared/logger';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
}

export default class JWTService {
  private static jwtConfig: JWTConfig;

  private static initializeConfig(): void {
    try {
      this.jwtConfig = config.get('jwt');
    } catch (error) {
      logger.warn('JWT config not found, using environment variables or defaults');
    }
  }

  private static getJWTSecret(): jwt.Secret {
    if (!this.jwtConfig) {
      this.initializeConfig();
    }
    return this.jwtConfig.secret;
  }

  private static getJWTExpiresIn(): string {
    if (!this.jwtConfig) {
      this.initializeConfig();
    }
    return this.jwtConfig.expiresIn;
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign({ ...payload }, this.getJWTSecret(), {
      expiresIn: this.getJWTExpiresIn(),
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.getJWTSecret()) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1]) {
      return parts[1];
    }
    return null;
  }
}
