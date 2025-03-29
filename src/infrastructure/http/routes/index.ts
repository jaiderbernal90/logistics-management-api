import { Router } from 'express';
import { AuthRoutes } from './auth.route';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/auth', AuthRoutes.routes);

    return router;
  }
}