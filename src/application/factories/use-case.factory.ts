import { MysqlShipmentRepository } from '@/infrastructure/persistence/repositories/shipment.repository.mysql';
import { MysqlPackageRepository } from '@/infrastructure/persistence/repositories/package.repository.mysql';
import { MysqlRouteRepository } from '@/infrastructure/persistence/repositories/route.repository.mysql';
import { MysqlTransporterRepository } from '@/infrastructure/persistence/repositories/transporter.repository.mysql';
import { MysqlOrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';
import { redisService } from '@/infrastructure/services/redis/redis.service';
import { CreateShipmentUseCase } from '@/application/use-cases/shipment/create';
import { AssignRouteUseCase } from '@/application/use-cases/route/assign-route';
import { TrackShipmentUseCase } from '@/application/use-cases/shipment/track-shipment';
import { GetUserShipmentsUseCase } from '@/application/use-cases/shipment/get-user-shipments';
import { GetAvailableRoutesUseCase } from '@/application/use-cases/route/get-available-routes';
import { GetAvailableTransportersUseCase } from '@/application/use-cases/transporter/get-available-transporters';
import { ShipmentHistoryUseCase } from '@/application/use-cases/shipment/get-shipment-history';
import { UpdateShipmentStatusUseCase } from '../use-cases/shipment/update-shipment-status';
import { GetAllShipmentsUseCase } from '../use-cases/shipment/get-all-shipments';
import { GetByIdShipmentsUseCase } from '../use-cases/shipment/get-by-id-shipment';
import { GetTransporterPerformanceUseCase } from '../use-cases/report/get-transporter-performance';
import { GetShipmentDetailedUseCase } from '../use-cases/report/get-shipment-detailed';

export class UseCaseFactory {
  private static shipmentRepository = new MysqlShipmentRepository();
  private static packageRepository = new MysqlPackageRepository();
  private static routeRepository = new MysqlRouteRepository();
  private static transporterRepository = new MysqlTransporterRepository();
  private static orderStatusRepository = new MysqlOrderStatusRepository();

  private static cacheService = redisService;

  static createCreateShipmentUseCase(): CreateShipmentUseCase {
    return new CreateShipmentUseCase(
      this.shipmentRepository,
      this.packageRepository,
      this.orderStatusRepository,
    );
  }

  static createAssignRouteUseCase(): AssignRouteUseCase {
    return new AssignRouteUseCase(
      this.shipmentRepository,
      this.routeRepository,
      this.transporterRepository,
      this.packageRepository,
      this.orderStatusRepository,
    );
  }

  static createGetAllShipmentsUseCase(): GetAllShipmentsUseCase {
    return new GetAllShipmentsUseCase(this.shipmentRepository);
  }

  static createGetTransporterPerformanceUseCase(): GetTransporterPerformanceUseCase {
    return new GetTransporterPerformanceUseCase(
      this.shipmentRepository,
      this.cacheService,
    );
  }

  static createGetShipmentDetailedUseCase(): GetShipmentDetailedUseCase {
    return new GetShipmentDetailedUseCase(
      this.shipmentRepository,
      this.cacheService,
    );
  }

  static createGetByIdShipmentUseCase(): GetByIdShipmentsUseCase {
    return new GetByIdShipmentsUseCase(this.shipmentRepository);
  }

  static createTrackShipmentUseCase(): TrackShipmentUseCase {
    return new TrackShipmentUseCase(
      this.shipmentRepository,
      this.packageRepository,
      this.orderStatusRepository,
      this.cacheService,
    );
  }

  static createUpdateShipmentStatusUseCase(): UpdateShipmentStatusUseCase {
    return new UpdateShipmentStatusUseCase(
      this.shipmentRepository,
      this.orderStatusRepository,
      this.cacheService,
    );
  }

  static createGetUserShipmentsUseCase(): GetUserShipmentsUseCase {
    return new GetUserShipmentsUseCase(this.shipmentRepository);
  }

  static createGetAvailableRoutesUseCase(): GetAvailableRoutesUseCase {
    return new GetAvailableRoutesUseCase(this.routeRepository);
  }

  static createGetAvailableTransportersUseCase(): GetAvailableTransportersUseCase {
    return new GetAvailableTransportersUseCase(this.transporterRepository);
  }

  static createShipmentHistoryUseCase(): ShipmentHistoryUseCase {
    return new ShipmentHistoryUseCase(
      this.orderStatusRepository,
      this.shipmentRepository,
    );
  }
}
