import { Request, Response, Router } from 'express';
import { validate } from '../../middlewares/errors.middleware';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import {
  authMiddleware,
  AuthenticatedRequest,
  authorizeRoles,
} from '../../middlewares/auth.middleware';
import { trackingNumberValidator } from '@/application/validators/tracking.validator';
import { updateShipmentStatusValidator } from '@/application/validators/shipment-status.validator';
import { UseCaseFactory } from '@/application/factories/use-case.factory';
import { TrackingController } from '../../controller/tracking.controller';

export class TrackingRoutes {
  static get routes(): Router {
    const router = Router();
    const jwtService = new JwtAuthService();

    const trackShipmentUseCase = UseCaseFactory.createTrackShipmentUseCase();
    const updateShipmentStatusUseCase =
      UseCaseFactory.createUpdateShipmentStatusUseCase();
    const shipmentHistoryUseCase =
      UseCaseFactory.createShipmentHistoryUseCase();

    const trackingController = new TrackingController(
      trackShipmentUseCase,
      updateShipmentStatusUseCase,
      shipmentHistoryUseCase,
    );

    const auth = authMiddleware(jwtService);

    router.get(
      '/track/:trackingNumber',
      trackingNumberValidator,
      validate as any,
      (req: Request, res: Response) => {
        trackingController.trackShipment(req, res);
      },
    );

    router.put(
      '/:shipmentId/status',
      [
        auth,
        authorizeRoles(['ADMIN', 'DRIVER']),
        updateShipmentStatusValidator,
        validate as any,
      ],
      (req: Request, res: Response) => {
        trackingController.updateShipmentStatus(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    router.get(
      '/history/:trackingNumber',
      auth as any,
      (req: Request, res: Response) => {
        trackingController.getStatusHistory(req, res);
      },
    );

    return router;
  }
}
