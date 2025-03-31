import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { CacheService } from '@/domain/ports/services/cache.service.port';
import { createLogger } from '@/infrastructure/logger';
import {
  ShipmentAdvancedFilterDto,
  ShipmentDetailedResponseDto,
} from '@/application/dtos/report/shipment-detailed.dto';
import { PageRequest } from '@/domain/interfaces/pagination.interface';

const logger = createLogger('shipment-detailed-use-case');
const CACHE_TTL = 300; // 5 minutos

export class GetShipmentDetailedUseCase {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    filters: ShipmentAdvancedFilterDto,
  ): Promise<ShipmentDetailedResponseDto> {
    try {
      // Crear clave de caché basada en los filtros
      const cacheKey = `shipments:detailed:${JSON.stringify(filters)}`;

      // Verificar si los datos ya están en caché
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(
          `Retrieved shipment detailed data from cache with filters: ${JSON.stringify(
            filters,
          )}`,
        );
        return cachedData;
      }

      // Configurar la paginación
      const pageRequest: PageRequest = {
        page: filters.page || 1,
        limit: filters.limit || 20,
      };

      // Obtener los datos si no están en caché
      const shipmentsData = await this.shipmentRepository.findShipmentsAdvanced(
        filters,
        pageRequest,
      );

      // Crear el objeto de respuesta
      const response: ShipmentDetailedResponseDto = {
        items: shipmentsData.items,
        total: shipmentsData.total,
        page: shipmentsData.page,
        limit: shipmentsData.limit,
        totalPages: shipmentsData.totalPages,
      };

      // Guardar en caché para futuras solicitudes
      await this.cacheService.set(cacheKey, response, CACHE_TTL);

      return response;
    } catch (error) {
      logger.error('Error getting detailed shipments', error);
      throw new Error('Error getting detailed shipments: ' + error.message);
    }
  }
}
