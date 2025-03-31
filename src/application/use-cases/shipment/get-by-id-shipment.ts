import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { createLogger } from '@/infrastructure/logger';
import { CacheService } from '@/domain/ports/services/cache.service.port';
import { ShipmentState } from '@/domain/entities/shipment.entity';

const logger = createLogger('get-pending-shipments-use-case');

export class GetByIdShipmentsUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
  ) {}

  async execute(id: number) {
    try {
      return await this.shipmentRepository.findById(id);

    } catch (error) {
      logger.error('Error getting pending shipments', error);
      throw error;
    }
  }
}
