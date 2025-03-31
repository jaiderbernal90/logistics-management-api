import { Request, Response } from 'express';
import { createLogger } from '@/infrastructure/logger';
import { TransporterPerformanceFilterDto } from '@/application/dtos/report/transporter-performance.dto';
import { GetTransporterPerformanceUseCase } from '@/application/use-cases/report/get-transporter-performance';
import { GetShipmentDetailedUseCase } from '@/application/use-cases/report/get-shipment-detailed';
import { ShipmentAdvancedFilterDto } from '@/application/dtos/report/shipment-detailed.dto';
import { ShipmentState } from '@/domain/entities/shipment.entity';

const logger = createLogger('report-controller');

export class ReportController {
  constructor(
    private readonly getTransporterPerformanceUseCase: GetTransporterPerformanceUseCase,
    private readonly getShipmentDetailedUseCase: GetShipmentDetailedUseCase,
  ) {}

  async getTransporterPerformance(req: Request, res: Response) {
    try {
      const filters: TransporterPerformanceFilterDto = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await this.getTransporterPerformanceUseCase.execute(
        filters,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting transporter performance', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting transporter performance',
        error: error.message,
      });
    }
  }

  async getShipmentDetailed(req: Request, res: Response) {
    try {
      const filters: ShipmentAdvancedFilterDto = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        state: req.query.state as ShipmentState,
        transporterId: req.query.transporterId
          ? Number(req.query.transporterId)
          : undefined,
        routeId: req.query.routeId ? Number(req.query.routeId) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await this.getShipmentDetailedUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting detailed shipments', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting detailed shipments',
        error: error.message,
      });
    }
  }
}
