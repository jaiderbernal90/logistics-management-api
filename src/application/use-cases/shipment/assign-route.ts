// src/application/use-cases/shipment/assign-route.ts
import { ShipmentState } from '@/domain/entities/shipment.entity';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { TransporterRepository } from '@/domain/ports/repositories/transporter.repository.port';
import { RouteRepository } from '@/domain/ports/repositories/route.repository.port';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { MysqlOrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('assign-route-use-case');

export class AssignRouteUseCase {
  private orderStatusRepository: MysqlOrderStatusRepository;

  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly routeRepository: RouteRepository,
    private readonly transporterRepository: TransporterRepository,
    private readonly packageRepository: PackageRepository,
  ) {
    this.orderStatusRepository = new MysqlOrderStatusRepository();
  }

  async execute(assignmentData: {
    shipment_id: number;
    route_id: number;
    transporter_id: number;
  }) {
    const shipment = await this.shipmentRepository.findById(
      assignmentData.shipment_id,
    );
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    if (shipment.state !== ShipmentState.EN_ESPERA) {
      throw new Error('Shipment is not in waiting status');
    }

    // 2. Verificar que la ruta existe
    const route = await this.routeRepository.findById(assignmentData.route_id);
    if (!route) {
      throw new Error('Route not found');
    }

    // 3. Verificar que el transportista existe y está disponible
    const transporter = await this.transporterRepository.findById(
      assignmentData.transporter_id,
    );
    if (!transporter) {
      throw new Error('Transporter not found');
    }

    if (!transporter.is_available) {
      throw new Error('Transporter is not available');
    }

    // 4. Obtener el paquete asociado al envío
    const packageData = await this.packageRepository.findByShipmentId(
      shipment.id,
    );
    if (!packageData) {
      throw new Error('Package not found for this shipment');
    }

    // 5. Validación simple de capacidad basada solo en peso
    // Obtener envíos asignados al transportista que estén en tránsito
    const assignedShipments =
      await this.shipmentRepository.findByTransporterAndState(
        transporter.id,
        ShipmentState.EN_TRANSITO,
      );

    // Calcular peso total actual
    let currentTotalWeight = 0;
    for (const assignedShipment of assignedShipments) {
      const pkg = await this.packageRepository.findByShipmentId(
        assignedShipment.id,
      );
      if (pkg) {
        currentTotalWeight += pkg.weight;
      }
    }

    // Validar si excede la capacidad
    if (currentTotalWeight + packageData.weight > transporter.capacity) {
      throw new Error(
        'Transporter does not have enough capacity for this package',
      );
    }

    // 6. Actualizar el envío con la ruta y transportista asignados
    const updatedShipment = await this.shipmentRepository.update(shipment.id, {
      route_id: route.id,
      transporter_id: transporter.id,
      state: ShipmentState.EN_TRANSITO,
    });

    // 7. Registrar el cambio de estado
    await this.orderStatusRepository.create({
      shipment_id: shipment.id,
      status: ShipmentState.EN_TRANSITO,
      location: route.origin,
    });

    // 8. Actualizar disponibilidad del transportista si está al máximo de capacidad
    if (currentTotalWeight + packageData.weight >= transporter.capacity * 0.9) {
      // Al 90% o más
      await this.transporterRepository.updateAvailability(
        transporter.id,
        false,
      );
    }

    // 9. Devolver respuesta
    return {
      message: 'Shipment successfully assigned to route and transporter',
      shipment: {
        id: updatedShipment.id,
        tracking_number: updatedShipment.tracking_number,
        state: updatedShipment.state,
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
