import { ShipmentState } from '@/domain/entities/shipment.entity';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { TransporterRepository } from '@/domain/ports/repositories/transporter.repository.port';
import { RouteRepository } from '@/domain/ports/repositories/route.repository.port';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { AssignShipmentDto } from '@/application/dtos/shipment-assignment/shipment-assignment.dto';
import { TransporterDto } from '@/application/dtos/transporter/transporter.dto';
import { RouteDto } from '@/application/dtos/route/route.dto';
import { Package } from '@/domain/entities/package.entity';
import { Shipment } from '@/domain/entities/shipment.entity';
import { OrderStatusRepository } from '@/domain/ports/repositories/order-status.port';
import {
  WebSocketMessage,
  WebSocketService as IWebSocketService,
} from '@/domain/ports/services/websocket.service.port';
import { WebSocketService } from '@/infrastructure/services/websocket/websocket.service';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('assign-route-use-case');

export class AssignRouteUseCase {
  private webSocketService: IWebSocketService;

  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly routeRepository: RouteRepository,
    private readonly transporterRepository: TransporterRepository,
    private readonly packageRepository: PackageRepository,
    private readonly orderStatusRepository: OrderStatusRepository,
  ) {}

  async execute(assignmentData: AssignShipmentDto) {
    const shipment = await this.validateAndGetShipment(
      assignmentData.shipment_id,
    );
    const route = await this.validateAndGetRoute(assignmentData.route_id);
    const transporter = await this.validateAndGetTransporter(
      assignmentData.transporter_id,
    );
    const packageData = await this.validateAndGetPackage(shipment.id);

    await this.validateTransporterCapacity(transporter, packageData);

    const updatedShipment = await this.assignShipmentToRouteAndTransporter(
      shipment,
      route,
      transporter,
    );

    await this.createStatusRecord(shipment.id, route.origin);

    await this.updateTransporterAvailabilityIfNeeded(transporter, packageData);

    try {
      const notification: WebSocketMessage = {
        trackingNumber: updatedShipment.tracking_number,
        status: updatedShipment.state as ShipmentState,
        location: route.origin,
        created_at: updatedShipment.updated_at,
      };
      this.webSocketService = WebSocketService.getInstance();
      this.webSocketService.notifyStatusUpdate(
        updatedShipment.tracking_number,
        notification,
      );

      logger.info(
        `WebSocket notification sent for tracking: ${updatedShipment.tracking_number}`,
      );
    } catch (wsError) {
      logger.warn(
        `WebSocket notification error for ${updatedShipment.tracking_number}: ${wsError.message}`,
      );
    }

    return this.prepareResponse(updatedShipment, route, transporter);
  }

  private async validateAndGetShipment(shipmentId: number): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (shipment.state !== ShipmentState.EN_ESPERA) {
      throw new Error('Shipment is not in waiting status');
    }

    return shipment;
  }

  private async validateAndGetRoute(routeId: number): Promise<RouteDto> {
    const route = await this.routeRepository.findById(routeId);

    if (!route) {
      throw new Error('Route not found');
    }

    return route;
  }

  private async validateAndGetTransporter(
    transporterId: number,
  ): Promise<TransporterDto> {
    const transporter = await this.transporterRepository.findById(
      transporterId,
    );

    if (!transporter) {
      throw new Error('Transporter not found');
    }

    if (!transporter.is_available) {
      throw new Error('Transporter is not available');
    }

    return transporter;
  }

  private async validateAndGetPackage(shipmentId: number): Promise<Package> {
    const packageData = await this.packageRepository.findByShipmentId(
      shipmentId,
    );

    if (!packageData) {
      throw new Error('Package not found for this shipment');
    }

    return packageData;
  }

  private async validateTransporterCapacity(
    transporter: TransporterDto,
    packageData: Package,
  ): Promise<void> {
    const assignedShipments =
      await this.shipmentRepository.findByTransporterAndState(
        transporter.id,
        ShipmentState.EN_TRANSITO,
      );

    let currentTotalWeight = 0;
    for (const assignedShipment of assignedShipments) {
      const pkg = await this.packageRepository.findByShipmentId(
        assignedShipment.id,
      );
      if (pkg) {
        currentTotalWeight += pkg.weight;
      }
    }

    if (currentTotalWeight + packageData.weight > transporter.capacity) {
      throw new Error(
        'Transporter does not have enough capacity for this package',
      );
    }
  }

  private async assignShipmentToRouteAndTransporter(
    shipment: Shipment,
    route: RouteDto,
    transporter: TransporterDto,
  ): Promise<Shipment> {
    return await this.shipmentRepository.update(shipment.id, {
      route_id: route.id,
      transporter_id: transporter.id,
      state: ShipmentState.EN_TRANSITO,
    });
  }

  private async createStatusRecord(
    shipmentId: number,
    location: string,
  ): Promise<void> {
    await this.orderStatusRepository.create({
      shipment_id: shipmentId,
      status: ShipmentState.EN_TRANSITO,
      location: location,
    });
  }

  private async updateTransporterAvailabilityIfNeeded(
    transporter: TransporterDto,
    packageData: Package,
  ): Promise<void> {
    const assignedShipments =
      await this.shipmentRepository.findByTransporterAndState(
        transporter.id,
        ShipmentState.EN_TRANSITO,
      );

    let totalWeight = packageData.weight;
    for (const assignedShipment of assignedShipments) {
      const pkg = await this.packageRepository.findByShipmentId(
        assignedShipment.id,
      );
      if (pkg) {
        totalWeight += pkg.weight;
      }
    }

    if (totalWeight >= transporter.capacity * 0.9) {
      await this.transporterRepository.updateAvailability(
        transporter.id,
        false,
      );
    }
  }

  private prepareResponse(
    shipment: Shipment,
    route: RouteDto,
    transporter: TransporterDto,
  ) {
    return {
      message: 'Shipment successfully assigned to route and transporter',
      shipment: {
        id: shipment.id,
        tracking_number: shipment.tracking_number,
        state: shipment.state,
        route: {
          id: route.id,
          name: route.name,
        },
        transporter: {
          id: transporter.id,
          name: transporter.name,
          plate: transporter.plate,
        },
      },
    };
  }
}
