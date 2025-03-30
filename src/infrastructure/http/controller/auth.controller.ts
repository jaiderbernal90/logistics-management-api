import { Request, Response } from 'express';

import { createLogger } from '../../../infrastructure/logger';
import { LoginUseCase } from '@/application/use-cases/auth/login';
import { RegisterUseCase } from '@/application/use-cases/auth/register';

const logger = createLogger('auth-controller');

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUserUseCase: LoginUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.registerUseCase.execute(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Error in register controller', error);
      res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const authResponse = await this.loginUserUseCase.execute(req.body);

      res.status(200).json(authResponse);
    } catch (error: any) {
      logger.error('Error in login controller', error);
      res.status(500).json({ message: error.message });
    }
  }
}
