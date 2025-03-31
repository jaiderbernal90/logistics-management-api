import { Router } from 'express';
import { AuthRoutes } from './auth.route';
import { ShipmentRoutes } from './shipments/shipment-management.route';
import { TrackingRoutes } from './shipments/tracking.route';
import { RouteRoutes } from './shipments/route.route';
import { ReportRoutes } from './shipments/report.route';
import { TransporterRoutes } from './shipments/transporter.route';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/auth', AuthRoutes.routes);
    router.use('/shipments', ShipmentRoutes.routes);
    router.use('/shipments', TrackingRoutes.routes);
    router.use('/routes', RouteRoutes.routes);
    router.use('/transporters', TransporterRoutes.routes);
    router.use('/reports', ReportRoutes.routes);

    return router;
  }
}
