import { Router } from 'express';
import { AuthRoutes } from './auth.route';
import { ShipmentRoutes } from './shipment.route';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/auth', AuthRoutes.routes);
    router.use('/shipments', ShipmentRoutes.routes);

    return router;
  }
}