import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { CacheService } from '@/domain/ports/services/cache.service.port';
import { createLogger } from '@/infrastructure/logger';
import {
  TransporterPerformanceFilterDto,
  TransporterPerformanceResponseDto,
} from '@/application/dtos/report/transporter-performance.dto';

const logger = createLogger('transporter-performance-use-case');
const CACHE_TTL = 300;

export class GetTransporterPerformanceUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    filters: TransporterPerformanceFilterDto,
  ): Promise<TransporterPerformanceResponseDto> {
    try {
      const cacheKey = `reports:transporter-performance:${JSON.stringify(
        filters,
      )}`;

      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(
          `Retrieved transporter performance data from cache with filters: ${JSON.stringify(
            filters,
          )}`,
        );
        return cachedData;
      }

      const performanceData =
        await this.shipmentRepository.getTransportersPerformance({
          startDate: filters.startDate,
          endDate: filters.endDate,
        });

      const response: TransporterPerformanceResponseDto = {
        transporters: performanceData.transporters,
        overallAvgDeliveryTime: performanceData.overallAvgDeliveryTime,
        totalShipments: performanceData.totalShipments,
      };

      await this.cacheService.set(cacheKey, response, CACHE_TTL);

      return response;
    } catch (error) {
      logger.error('Error getting transporter performance', error);
      throw new Error(
        'Error getting transporter performance: ' + error.message,
      );
    }
  }
}
