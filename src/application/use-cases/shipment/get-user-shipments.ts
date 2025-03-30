import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('get-user-shipments-use-case');

export class GetUserShipmentsUseCase {
  constructor(private readonly shipmentRepository: ShipmentRepository) {}

  async execute(userId: number) {
    try {
      return await this.shipmentRepository.findByUserId(userId);
    } catch (error) {
      logger.error(`Error getting shipments for user: ${userId}`, error);
      throw error;
    }
  }
}
