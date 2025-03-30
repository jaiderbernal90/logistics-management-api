// src/application/use-cases/shipment/track-shipment.ts

import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { MysqlOrderStatusRepository } from '@/infrastructure/persistence/repositories/order-status.repository.mysql';
import { redisService } from '@/infrastructure/services/redis/redis.service';
import { createLogger } from '@/infrastructure/logger';
import { ShipmentState } from '@/domain/entities/shipment.entity';
import {
  WebSocketService,
  WebSocketMessage,
} from '@/domain/ports/services/websocket.service.port';

const logger = createLogger('track-shipment-use-case');
const CACHE_TTL = 300;

export class TrackShipmentUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly packageRepository: PackageRepository,
    private readonly orderStatusRepository: MysqlOrderStatusRepository,
    private readonly webSocketService: WebSocketService,
  ) {}

  async execute(trackingNumber: string, userId?: number) {
    try {
      const cacheKey = `shipment:tracking:${trackingNumber}`;
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        logger.info(`Retrieved shipment data from cache: ${trackingNumber}`);
        return cachedData;
      }

      const shipment = await this.shipmentRepository.findByTrackingNumber(
        trackingNumber,
      );

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      if (userId && shipment.user_id !== userId) {
        throw new Error('You do not have permission to view this shipment');
      }

      const packageData = await this.packageRepository.findByShipmentId(
        shipment.id,
      );

      const statusHistory = await this.orderStatusRepository.findByShipmentId(
        shipment.id,
      );

      const response = {
        shipment: {
          id: shipment.id,
          tracking_number: shipment.tracking_number,
          state: shipment.state,
          date: shipment.date,
          delivery_date: shipment.delivery_date,
          origin_address: shipment.origin_address,
          destination_address: shipment.destination_address,
        },
        package: packageData,
        status_history: statusHistory,
      };

      await redisService.set(cacheKey, response, CACHE_TTL);

      return response;
    } catch (error) {
      logger.error(`Error tracking shipment: ${trackingNumber}`, error);
      throw error;
    }
  }

  async updateShipmentStatus(
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
      await redisService.del(cacheKey);

      try {
        const notification: WebSocketMessage = {
          tracking_number: trackingNumber,
          state: newState,
          location: location,
          timestamp: statusRecord.created_at || new Date(),
          additional_info: additionalInfo,
        };

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

  async getStatusUpdatesHistory(trackingNumber: string) {
    try {
      const shipment = await this.shipmentRepository.findByTrackingNumber(
        trackingNumber,
      );

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      const statusHistory = await this.orderStatusRepository.findByShipmentId(
        shipment.id,
      );

      const updates = statusHistory.map((status) => ({
        tracking_number: trackingNumber,
        state: status.status,
        location: status.location || 'Unknown',
        timestamp: status.created_at || new Date(),
      }));

      return updates;
    } catch (error) {
      logger.error(
        `Error getting status history for tracking: ${trackingNumber}`,
        error,
      );
      throw error;
    }
  }
}
