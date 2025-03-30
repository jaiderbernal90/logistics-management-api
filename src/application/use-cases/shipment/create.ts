import {
  CreateShipmentDto,
  ShipmentDto,
} from '@/application/dtos/shipment/shipment.dto';
import { Shipment, ShipmentState } from '@/domain/entities/shipment.entity';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { getTrackingNumber } from '@/infrastructure/utils/tracking-number';
import { MysqlOrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';

export class CreateShipmentUseCase {
  private orderStatusRepository: MysqlOrderStatusRepository;

  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly packageRepository: PackageRepository,
  ) {
    this.orderStatusRepository = new MysqlOrderStatusRepository();
  }

  async execute(
    shipmentData: CreateShipmentDto,
    userId: number,
  ): Promise<ShipmentDto> {
    const trackingNumber = getTrackingNumber();

    const newShipment: Partial<Shipment> = {
      user_id: userId,
      tracking_number: trackingNumber,
      state: ShipmentState.EN_ESPERA,
      date: new Date(),
      origin_address: shipmentData.origin_address,
      destination_address: shipmentData.destination_address,
    };

    const createdShipment = await this.shipmentRepository.create(newShipment);

    await this.orderStatusRepository.create({
      shipment_id: createdShipment.id,
      status: ShipmentState.EN_ESPERA,
      location: shipmentData.origin_address,
    });

    const packageData = shipmentData.package;
    const createdPackage = await this.packageRepository.create(
      packageData,
      userId,
      createdShipment.id,
    );

    return {
      id: createdShipment.id,
      tracking_number: createdShipment.tracking_number,
      state: createdShipment.state,
      date: createdShipment.date,
      delivery_date: createdShipment.delivery_date,
      origin_address: createdShipment.origin_address,
      destination_address: createdShipment.destination_address,
      package: {
        id: createdPackage.id,
        weight: createdPackage.weight,
        size: createdPackage.size,
        type_of_product: createdPackage.type_of_product,
        description: createdPackage.description,
        value: createdPackage.value,
        shipment_id: createdPackage.shipment_id,
      },
    };
  }
}
