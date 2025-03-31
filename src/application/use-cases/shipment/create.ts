import {
  CreateShipmentDto,
  ShipmentDto,
} from '@/application/dtos/shipment/shipment.dto';
import { Shipment, ShipmentState } from '@/domain/entities/shipment.entity';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { getTrackingNumber } from '@/infrastructure/utils/tracking-number';
import { createLogger } from '@/infrastructure/logger';
import { Package } from '@/domain/entities/package.entity';
import { OrderStatusRepository } from '@/domain/ports/repositories/order-status.port';

const logger = createLogger('create-shipment-use-case');

export class CreateShipmentUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly packageRepository: PackageRepository,
    private readonly orderStatusRepository: OrderStatusRepository,
  ) {}

  async execute(
    shipmentData: CreateShipmentDto,
    userId: number,
  ): Promise<ShipmentDto> {
    try {
      const trackingNumber = this.generateTrackingNumber();

      const createdShipment = await this.createShipment(
        shipmentData,
        userId,
        trackingNumber,
      );

      await this.createInitialStatus(
        createdShipment.id,
        shipmentData.origin_address,
      );

      const createdPackage = await this.createPackage(
        shipmentData.package,
        userId,
        createdShipment.id,
      );

      return this.createShipmentDto(createdShipment, createdPackage);
    } catch (error) {
      logger.error('Error creating shipment', error);
      throw error;
    }
  }

  private generateTrackingNumber(): string {
    return getTrackingNumber();
  }

  private async createShipment(
    shipmentData: CreateShipmentDto,
    userId: number,
    trackingNumber: string,
  ): Promise<Shipment> {
    const newShipment: Partial<Shipment> = {
      user_id: userId,
      tracking_number: trackingNumber,
      state: ShipmentState.EN_ESPERA,
      date: new Date(),
      origin_address: shipmentData.origin_address,
      destination_address: shipmentData.destination_address,
    };

    return await this.shipmentRepository.create(newShipment);
  }

  private async createInitialStatus(
    shipmentId: number,
    location: string,
  ): Promise<void> {
    await this.orderStatusRepository.create({
      shipment_id: shipmentId,
      status: ShipmentState.EN_ESPERA,
      location: location,
    });
  }

  private async createPackage(
    packageData: CreateShipmentDto['package'],
    userId: number,
    shipmentId: number,
  ): Promise<Package> {
    return await this.packageRepository.create(packageData, userId, shipmentId);
  }

  private createShipmentDto(
    shipment: Shipment,
    packageData: Package,
  ): ShipmentDto {
    return {
      id: shipment.id,
      tracking_number: shipment.tracking_number,
      state: shipment.state,
      date: shipment.date,
      delivery_date: shipment.delivery_date,
      origin_address: shipment.origin_address,
      destination_address: shipment.destination_address,
      package: {
        id: packageData.id,
        weight: packageData.weight,
        size: packageData.size,
        type_of_product: packageData.type_of_product,
        description: packageData.description,
        value: packageData.value,
        shipment_id: packageData.shipment_id,
      },
    };
  }
}
