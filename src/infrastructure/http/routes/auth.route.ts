import { Request, Response, Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { MysqlUserRepository } from '@/infrastructure/persistence/repositories/user.repository.mysql';
import {
  loginUserValidator,
  registerUserValidator,
} from '@/application/validators/auth.validator';
import { RegisterUseCase } from '@/application/use-cases/auth/register';
import { LoginUseCase } from '@/application/use-cases/auth/login';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import { validate } from '../middlewares/errors.middleware';

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    const userRepository = new MysqlUserRepository();
    const jwtService = new JwtAuthService();

    const loginUseCase = new LoginUseCase(userRepository, jwtService);
    const registerUseCase = new RegisterUseCase(userRepository);

    const authController = new AuthController(registerUseCase, loginUseCase);

    router.post(
      '/register',
      [registerUserValidator, validate as any],
      (req: Request, res: Response) => {
        return authController.register(req, res);
      },
    );

    router.post(
      '/login',
      [loginUserValidator, validate as any],
      (req: Request, res: Response) => {
        return authController.login(req, res);
      },
    );

    return router;
  }
}
