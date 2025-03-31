import { Request, Response, Router } from 'express';
import { createShipmentValidator } from '@/application/validators/shipment.validator';
import { validate } from '../../middlewares/errors.middleware';
import { JwtAuthService } from '@/infrastructure/security/jwt.service';
import {
  authMiddleware,
  AuthenticatedRequest,
  authorizeRoles,
} from '../../middlewares/auth.middleware';
import { assignShipmentValidator } from '@/application/validators/shipment-assignment.validator';
import { UseCaseFactory } from '@/application/factories/use-case.factory';
import { ShipmentManagementController } from '../../controller/shipment-management.controller';

export class ShipmentRoutes {
  static get routes(): Router {
    const router = Router();
    const jwtService = new JwtAuthService();

    const createShipmentUseCase = UseCaseFactory.createCreateShipmentUseCase();
    const assignRouteUseCase = UseCaseFactory.createAssignRouteUseCase();
    const getUserShipmentsUseCase =
      UseCaseFactory.createGetUserShipmentsUseCase();
    const getAllShipmentsUseCase =
      UseCaseFactory.createGetAllShipmentsUseCase();
    const getByIdShipmentUseCase =
      UseCaseFactory.createGetByIdShipmentUseCase();

    const shipmentManagementController = new ShipmentManagementController(
      createShipmentUseCase,
      assignRouteUseCase,
      getUserShipmentsUseCase,
      getAllShipmentsUseCase,
      getByIdShipmentUseCase,
    );

    const auth = authMiddleware(jwtService);

    router.post(
      '/',
      [auth, createShipmentValidator, validate as any],
      (req: Request, res: Response) => {
        shipmentManagementController.createShipment(
          req as AuthenticatedRequest,
          res,
        );
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
        shipmentManagementController.assignRoute(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    router.get(
      '/get/:id',
      [auth, authorizeRoles(['ADMIN'])] as any,
      (req: Request, res: Response) => {
        shipmentManagementController.getByIdShipment(req, res);
      },
    );

    router.get('/my-shipments', auth as any, (req: Request, res: Response) => {
      shipmentManagementController.getUserShipments(
        req as AuthenticatedRequest,
        res,
      );
    });

    router.get(
      '/all',
      [auth as any, authorizeRoles(['ADMIN'])],
      (req: Request, res: Response) => {
        shipmentManagementController.getAllShipments(
          req as AuthenticatedRequest,
          res,
        );
      },
    );

    return router;
  }
}
