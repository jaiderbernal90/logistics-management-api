import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { createLogger } from '@/infrastructure/logger';
import { CacheService } from '@/domain/ports/services/cache.service.port';
import { OrderStatusRepository } from '@/domain/ports/repositories/order-status.port';

const logger = createLogger('track-shipment-use-case');
const CACHE_TTL = 300;

export class TrackShipmentUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly packageRepository: PackageRepository,
    private readonly orderStatusRepository: OrderStatusRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(trackingNumber: string, userId?: number) {
    try {
      const cacheKey = `shipment:tracking:${trackingNumber}`;
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        logger.info(`Retrieved shipment data from cache: ${trackingNumber}`);
        return cachedData;
      }

      const shipment = await this.shipmentRepository.findByTrackingNumber(trackingNumber);

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      if (userId && shipment.user_id !== userId) {
        throw new Error('You do not have permission to view this shipment');
      }

      const packageData = await this.packageRepository.findByShipmentId(shipment.id);
      const statusHistory = await this.orderStatusRepository.findByShipmentId(shipment.id);

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

      await this.cacheService.set(cacheKey, response, CACHE_TTL);

      return response;
    } catch (error) {
      logger.error(`Error tracking shipment: ${trackingNumber}`, error);
      throw error;
    }
  }
}