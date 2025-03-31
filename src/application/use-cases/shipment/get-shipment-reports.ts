// import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
// import { TransporterRepository } from '@/domain/ports/repositories/transporter.repository.port';
// import { ShipmentState } from '@/domain/entities/shipment.entity';
// import { createLogger } from '@/infrastructure/logger';
// import {
//   ShipmentReportFiltersDto,
//   ShipmentReportResponseDto,
// } from '@/application/dtos/report/shipment-report.dto';
// import { CacheService } from '@/domain/ports/services/cache.service.port';
// import { PageRequest } from '@/domain/interfaces/pagination.interface';

// const logger = createLogger('shipment-report-use-case');
// const CACHE_TTL = 300;

// export class GetShipmentReportsUseCase {
//   constructor(
//     private readonly shipmentRepository: ShipmentRepository,
//     private readonly transporterRepository: TransporterRepository,
//     private readonly cacheService: CacheService,
//   ) {}

//   async execute(
//     filters: ShipmentReportFiltersDto,
//   ): Promise<ShipmentReportResponseDto> {
//     try {
//       // const cacheKey = `reports:shipments:${JSON.stringify(filters)}`;
//       // const cachedData = await this.cacheService.get(cacheKey);

//       // if (cachedData) {
//       //   logger.info(
//       //     `Retrieved shipment report data from cache with filters: ${JSON.stringify(
//       //       filters,
//       //     )}`,
//       //   );
//       //   return cachedData;
//       // }

//       // const pageRequest: PageRequest = {
//       //   page: filters.page || 1,
//       //   limit: filters.limit || 20,
//       // };

//       // const shipmentFilters = {
//       //   startDate: filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 19).replace('T', ' ') : undefined,
//       //   endDate: filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 19).replace('T', ' ') : undefined,
//       //   state: filters.state as ShipmentState,
//       //   transporterId: filters.transporterId,
//       // };

//       // const shipmentsData = await this.shipmentRepository.findWithFilters(
//       //   shipmentFilters,
//       //   pageRequest,
//       // );

//       // const transporters = await this.transporterRepository.findAll();
//       // const transportersPerformance = await Promise.all(
//       //   transporters.map(async (transporter) => {
//       //     const performanceData =
//       //       await this.shipmentRepository.getTransporterPerformance(
//       //         transporter.id,
//       //         {
//       //           startDate: shipmentFilters.startDate,
//       //           endDate: shipmentFilters.endDate,
//       //         },
//       //       );

//       //     return {
//       //       transporterId: transporter.id,
//       //       transporterName: transporter.name,
//       //       totalShipments: performanceData.totalShipments,
//       //       completedShipments: performanceData.completedShipments,
//       //       avgDeliveryTimeHours: performanceData.avgDeliveryTimeHours,
//       //       onTimePercentage: performanceData.onTimePercentage,
//       //     };
//       //   }),
//       // );

//       // const shipmentsByStatus =
//       //   await this.shipmentRepository.countByStatusWithFilters({
//       //     startDate: shipmentFilters.startDate,
//       //     endDate: shipmentFilters.endDate,
//       //     transporterId: shipmentFilters.transporterId,
//       //   });

//       // const totalShipments = shipmentsByStatus.reduce(
//       //   (acc, curr) => acc + curr.count,
//       //   0,
//       // );

//       // const shipmentsByStatusWithPercentage = shipmentsByStatus.map(
//       //   (status) => ({
//       //     state: status.state,
//       //     count: status.count,
//       //     percentage:
//       //       totalShipments > 0 ? (status.count / totalShipments) * 100 : 0,
//       //   }),
//       // );

//       // const timeFrameMetrics =
//       //   await this.shipmentRepository.getTimeFrameMetrics(shipmentFilters);

//       // const response: ShipmentReportResponseDto = {
//       //   shipments: {
//       //     items: shipmentsData.items,
//       //     total: shipmentsData.total,
//       //     page: shipmentsData.page,
//       //     limit: shipmentsData.limit,
//       //     totalPages: shipmentsData.totalPages,
//       //   },
//       //   performance: {
//       //     transporters: transportersPerformance,
//       //     shipmentsByStatus: shipmentsByStatusWithPercentage,
//       //     timeFrameMetrics: timeFrameMetrics,
//       //   },
//       // };

//       // await this.cacheService.set(cacheKey, response, CACHE_TTL);

//       // return response;
//     } catch (error) {
//       logger.error('Error generating shipment reports', error);
//       throw new Error('Error generating shipment reports: ' + error.message);
//     }
//   }
// }
