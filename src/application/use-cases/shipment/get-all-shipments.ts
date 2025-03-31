import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { createLogger } from '@/infrastructure/logger';
import { ShipmentState } from '@/domain/entities/shipment.entity';

const logger = createLogger('get-pending-shipments-use-case');

export class GetAllShipmentsUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
  ) {}

  async execute(state?: ShipmentState) {
    try {
      return await this.shipmentRepository.findAll(state);
    } catch (error) {
      logger.error('Error getting pending shipments', error);
      throw error;
    }
  }
}
