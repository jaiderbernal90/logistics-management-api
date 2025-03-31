import { Request, Response, NextFunction, RequestHandler } from 'express';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('auth-middleware');

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = (jwtService: JwtAuthService) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(401)
          .json(
            ApiResponse.error(
              'Authentication required. Please provide a valid token.',
            ),
          );
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return res
          .status(401)
          .json(
            ApiResponse.error(
              'Authentication required. Please provide a valid token.',
            ),
          );
      }

      const decoded = await jwtService.verifyToken(token);

      if (!decoded || typeof decoded === 'boolean') {
        return res
          .status(401)
          .json(
            ApiResponse.error('Invalid or expired token. Please login again.'),
          );
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      logger.error('Authentication error', error);
      return res
        .status(401)
        .json(ApiResponse.error('Authentication failed: ' + error.message));
    }
  };
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(ApiResponse.error('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          ApiResponse.error(
            'You do not have permission to access this resource.',
          ),
        );
    }

    next();
  };
};
