import { OrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('get-shipment-history-use-case');

export class GetShipmentHistoryUseCase {
  constructor(private readonly orderStatusRepository: OrderStatusRepository) {}

  async execute(shipmentId: number) {
    try {
      return await this.orderStatusRepository.findByShipmentId(shipmentId);
    } catch (error) {
      logger.error(`Error getting history for shipment: ${shipmentId}`, error);
      throw error;
    }
  }
}
