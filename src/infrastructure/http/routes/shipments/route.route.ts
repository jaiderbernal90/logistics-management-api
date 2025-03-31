import { Request, Response, Router } from 'express';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { WebSocketService } from '@/infrastructure/services/websocket/websocket.service';
import { UseCaseFactory } from '@/application/factories/use-case.factory';
import { RouteTransporterController } from '../../controller/route-transporter.controller';

export class RouteRoutes {
  static get routes(): Router {
    const router = Router();
    const webSocketService = WebSocketService.getInstance();
    const jwtService = new JwtAuthService();

    const getAvailableRoutesUseCase =
      UseCaseFactory.createGetAvailableRoutesUseCase();
    const getAvailableTransportersUseCase =
      UseCaseFactory.createGetAvailableTransportersUseCase();

    const routeTransporterController = new RouteTransporterController(
      getAvailableRoutesUseCase,
      getAvailableTransportersUseCase,
      webSocketService,
    );

    const auth = authMiddleware(jwtService);

    router.get('/', [auth] as any, (req: Request, res: Response) => {
      routeTransporterController.getAvailableRoutes(req, res);
    });

    return router;
  }
}
