import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import type { StringValue } from "ms";
import {
  IAuthService,
  TokenPayload,
} from '@/domain/ports/services/auth.service.port';
import { createLogger } from '../logger';
import envs from '../config/envs';

dotenv.config();
const logger = createLogger('jwt-service');

export class JwtAuthService implements IAuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: StringValue;

  constructor() {
    this.jwtSecret = envs.jwt.secret;
    this.jwtExpiresIn = envs.jwt.expiresIn as StringValue;
  }

  generateToken(user: TokenPayload): string {
    const payload: Record<string, any> = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    logger.info(`Generating token for user: ${user.email}`);

    try {
      const token = jwt.sign(
        payload,
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn },
      );

      logger.info(`Token generated successfully`);
      return token;
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  async verifyToken(token: string): Promise<boolean | TokenPayload> {
    try {
      if (!token || token.trim() === '') {
        logger.warn('Empty token provided to verification');
        return false;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;

      if (!decoded.userId || !decoded.email || !decoded.role) {
        logger.warn('Token payload missing required fields');
        return false;
      }

      logger.info(`Token verification successful for user: ${decoded.email}`);
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);

      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid token format or signature');
      }

      return false;
    }
  }
}
