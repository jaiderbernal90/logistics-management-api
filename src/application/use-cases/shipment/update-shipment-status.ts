import { ShipmentState } from '@/domain/entities/shipment.entity';
import { OrderStatusRepository } from '@/domain/ports/repositories/order-status.port';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { CacheService } from '@/domain/ports/services/cache.service.port';
import { WebSocketMessage, WebSocketService as IWebSocketService } from '@/domain/ports/services/websocket.service.port';
import { createLogger } from '@/infrastructure/logger';
import { WebSocketService } from '@/infrastructure/services/websocket/websocket.service';

const logger = createLogger('update-shipment-status-use-case');

export class UpdateShipmentStatusUseCase {
  private webSocketService: IWebSocketService;
  
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly orderStatusRepository: OrderStatusRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    shipmentId: number,
    newState: ShipmentState,
    location: string,
    additionalInfo?: string,
  ) {
    try {
      const shipment = await this.shipmentRepository.findById(shipmentId);

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      const { tracking_number: trackingNumber } = shipment;

      const updatedShipment = await this.shipmentRepository.update(shipmentId, {
        state: newState,
        delivery_date:
          newState === ShipmentState.ENTREGADO ? new Date() : undefined,
      });

      const statusRecord = await this.orderStatusRepository.create({
        shipment_id: shipmentId,
        status: newState,
        location: location,
      });

      const cacheKey = `shipment:tracking:${trackingNumber}`;
      await this.cacheService.del(cacheKey);

      try {
        const notification: WebSocketMessage = {
          trackingNumber: trackingNumber,
          status: newState,
          location: location,
          created_at: statusRecord.created_at || new Date(),
          additional_info: additionalInfo,
        };
        this.webSocketService = WebSocketService.getInstance();
        this.webSocketService.notifyStatusUpdate(trackingNumber, notification);
        
        logger.info(
          `WebSocket notification sent for tracking: ${trackingNumber}`,
        );
      } catch (wsError) {
        logger.warn(
          `WebSocket notification error for ${trackingNumber}: ${wsError.message}`,
        );
      }

      return {
        message: 'Shipment status updated successfully',
        shipment: updatedShipment,
        status: statusRecord,
      };
    } catch (error) {
      logger.error(`Error updating shipment status: ${shipmentId}`, error);
      throw error;
    }
  }
}
