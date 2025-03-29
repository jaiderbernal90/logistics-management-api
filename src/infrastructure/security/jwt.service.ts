// src/infrastructure/security/jwt.service.ts

import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {
  IAuthService,
  TokenPayload,
} from '@/domain/ports/services/auth.service.port';

dotenv.config();

export class JwtAuthService implements IAuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_for_dev';
    this.jwtExpiresIn = parseInt(process.env.JWT_EXPIRES_IN || '24h', 10);
  }

  generateToken(user: TokenPayload): string {
    const payload: TokenPayload = {
      userId: user.userId!,
      email: user.email!,
      role: user.role!,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  async verifyToken(token: string): Promise<boolean | TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      return false;
    }
  }
}
