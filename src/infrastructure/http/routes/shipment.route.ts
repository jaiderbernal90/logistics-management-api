import { Request, Response, Router } from 'express';
import { ShipmentController } from '../controller/shipment.controller';
import { MysqlShipmentRepository } from '@/infrastructure/persistence/repositories/shipment.repository.mysql';
import { MysqlPackageRepository } from '@/infrastructure/persistence/repositories/package.repository.mysql';
import { createShipmentValidator } from '@/application/validators/shipment.validator';
import { validate } from '../middlewares/errors.middleware';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import {
  authMiddleware,
  AuthenticatedRequest,
  authorizeRoles,
} from '../middlewares/auth.middleware';
import { CreateShipmentUseCase } from '@/application/use-cases/shipment/create';
import { AssignRouteUseCase } from '@/application/use-cases/shipment/assign-route';
import { MysqlRouteRepository } from '@/infrastructure/persistence/repositories/route.repository.mysql';
import { MysqlTransporterRepository } from '@/infrastructure/persistence/repositories/transporter.repository.mysql';
import { assignShipmentValidator } from '@/application/validators/shipment-assignment.validator';
import { GetAvailableTransportersUseCase } from '@/application/use-cases/transporter/get-available-transporters';
import { GetAvailableRoutesUseCase } from '@/application/use-cases/route/get-available-routes';
import { GetShipmentHistoryUseCase } from '@/application/use-cases/shipment/get-shipment-history';
import { GetUserShipmentsUseCase } from '@/application/use-cases/shipment/get-user-shipments';
import { GetPendingShipmentsUseCase } from '@/application/use-cases/shipment/get-pending-shipments';
import { TrackShipmentUseCase } from '@/application/use-cases/shipment/track-shipment';
import { MysqlOrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';
import { trackingNumberValidator } from '@/application/validators/tracking.validator';
import { updateShipmentStatusValidator } from '@/application/validators/shipment-status.validator';
import { WebSocketService } from '@/infrastructure/services/websocket/websocket.service';

export class ShipmentRoutes {
  static get routes(): Router {
    const router = Router();

    const webSocketService = WebSocketService.getInstance();

    const shipmentRepository = new MysqlShipmentRepository();
    const packageRepository = new MysqlPackageRepository();
    const routeRepository = new MysqlRouteRepository();
    const transporterRepository = new MysqlTransporterRepository();
    const orderStatusRepository = new MysqlOrderStatusRepository();

    const jwtService = new JwtAuthService();

    const createShipmentUseCase = new CreateShipmentUseCase(
      shipmentRepository,
      packageRepository,
    );

    const assignRouteUseCase = new AssignRouteUseCase(
      shipmentRepository,
      routeRepository,
      transporterRepository,
      packageRepository,
    );

    const trackShipmentUseCase = new TrackShipmentUseCase(
      shipmentRepository,
      packageRepository,
      orderStatusRepository,
      webSocketService,
    );

    const getPendingShipmentsUseCase = new GetPendingShipmentsUseCase(
      shipmentRepository,
    );

    const getUserShipmentsUseCase = new GetUserShipmentsUseCase(
      shipmentRepository,
    );

    const getShipmentHistoryUseCase = new GetShipmentHistoryUseCase(
      orderStatusRepository,
    );

    const getAvailableRoutesUseCase = new GetAvailableRoutesUseCase(
      routeRepository,
    );

    const getAvailableTransportersUseCase = new GetAvailableTransportersUseCase(
      transporterRepository,
    );

    const shipmentController = new ShipmentController(
      createShipmentUseCase,
      assignRouteUseCase,
      trackShipmentUseCase,
      getPendingShipmentsUseCase,
      getUserShipmentsUseCase,
      getShipmentHistoryUseCase,
      getAvailableRoutesUseCase,
      getAvailableTransportersUseCase,
      webSocketService,
    );

    const auth = authMiddleware(jwtService);

    router.post(
      '/',
      [auth, createShipmentValidator, validate as any],
      (req: Request, res: Response) => {
        shipmentController.createShipment(req as AuthenticatedRequest, res);
      },
    );

    router.post(
      '/assign',
      [
        auth,
        authorizeRoles(['ADMIN']),
        assignShipmentValidator,
        validate as any,
      ],
      (req: Request, res: Response) => {
        shipmentController.assignRoute(req as AuthenticatedRequest, res);
      },
    );

    router.get(
      '/track/:trackingNumber',
      trackingNumberValidator,
      validate as any,
      (req: Request, res: Response) => {
        shipmentController.trackShipment(req, res);
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
        shipmentController.updateShipmentStatus(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    router.get(
      '/pending',
      [auth, authorizeRoles(['ADMIN'])] as any,
      (req: Request, res: Response) => {
        shipmentController.getPendingShipments(req, res);
      },
    );

    router.get('/routes', [auth] as any, (req: Request, res: Response) => {
      shipmentController.getAvailableRoutes(req, res);
    });

    router.get(
      '/transporters',
      [auth, authorizeRoles(['ADMIN'])] as any,
      (req: Request, res: Response) => {
        shipmentController.getAvailableTransporters(req, res);
      },
    );

    router.get('/my-shipments', auth as any, (req: Request, res: Response) => {
      shipmentController.getUserShipments(req as AuthenticatedRequest, res);
    });

    router.get(
      '/:shipmentId/history',
      auth as any,
      (req: Request, res: Response) => {
        shipmentController.getStatusHistory(req, res);
      },
    );

    return router;
  }
}
