import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { ShipmentState } from '@/domain/entities/shipment.entity';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('get-pending-shipments-use-case');

export class GetPendingShipmentsUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  async execute() {
    try {
      return await this.shipmentRepository.findByState(ShipmentState.EN_ESPERA);
    } catch (error) {
      logger.error('Error getting pending shipments', error);
      throw error;
    }
  }
}
