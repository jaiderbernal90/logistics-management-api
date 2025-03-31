import { Request, Response, Router } from 'express';
import { validate } from '../../middlewares/errors.middleware';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import {
  authMiddleware,
  AuthenticatedRequest,
  authorizeRoles,
} from '../../middlewares/auth.middleware';
import { UseCaseFactory } from '@/application/factories/use-case.factory';
import { ReportController } from '../../controller/report.controller';

export class ReportRoutes {
  static get routes(): Router {
    const router = Router();
    const jwtService = new JwtAuthService();

    const getTransporterPerformanceUseCase =
      UseCaseFactory.createGetTransporterPerformanceUseCase();

    const getShipmentDetailedUseCase =
      UseCaseFactory.createGetShipmentDetailedUseCase();

    const reportController = new ReportController(
      getTransporterPerformanceUseCase,
      getShipmentDetailedUseCase,
    );

    const auth = authMiddleware(jwtService);

    router.get(
      '/transporters/performance',
      [auth, authorizeRoles(['ADMIN']), validate as any],
      (req: Request, res: Response) => {
        reportController.getTransporterPerformance(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    router.get(
      '/shipments/detailed',
      [auth, authorizeRoles(['ADMIN']), validate as any],
      (req: Request, res: Response) => {
        reportController.getShipmentDetailed(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    return router;
  }
}
