import { createLogger } from '@/infrastructure/logger';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { OrderStatus } from '@/domain/entities/order-status.entity';
import { OrderStatusRepository } from '@/domain/ports/repositories/order-status.port';

const logger = createLogger('shipment-history-use-case');

interface ShipmentHistoryResponse {
  tracking_number: string;
  state: string;
  location: string;
  timestamp: Date;
}
export class ShipmentHistoryUseCase {
  constructor(
    private readonly orderStatusRepository: OrderStatusRepository,
    private readonly shipmentRepository: ShipmentRepository,
  ) {}

  async executeById(shipmentId: number): Promise<OrderStatus[]> {
    try {
      logger.info(`Getting history for shipment ID: ${shipmentId}`);

      const shipment = await this.shipmentRepository.findById(shipmentId);
      if (!shipment) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      return await this.orderStatusRepository.findByShipmentId(shipmentId);
    } catch (error) {
      logger.error(`Error getting history for shipment: ${shipmentId}`, error);
      throw error;
    }
  }

  async executeByTrackingNumber(
    trackingNumber: string,
  ): Promise<ShipmentHistoryResponse[]> {
    try {
      logger.info(`Getting history for tracking number: ${trackingNumber}`);

      const shipment = await this.shipmentRepository.findByTrackingNumber(
        trackingNumber,
      );

      if (!shipment) {
        throw new Error(
          `Shipment with tracking number ${trackingNumber} not found`,
        );
      }

      const statusHistory = await this.orderStatusRepository.findByShipmentId(
        shipment.id,
      );

      return statusHistory.map((status) => ({
        tracking_number: trackingNumber,
        state: status.status,
        location: status.location || 'Unknown',
        timestamp: status.created_at || new Date(),
      }));
    } catch (error) {
      logger.error(
        `Error getting history for tracking: ${trackingNumber}`,
        error,
      );
      throw error;
    }
  }
}
