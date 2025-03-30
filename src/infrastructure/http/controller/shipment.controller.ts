// src/infrastructure/http/controller/shipment.controller.ts
import { Request, Response } from 'express';
import { createLogger } from '@/infrastructure/logger';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { CreateShipmentUseCase } from '@/application/use-cases/shipment/create';
import { AssignRouteUseCase } from '@/application/use-cases/shipment/assign-route';
import { TrackShipmentUseCase } from '@/application/use-cases/shipment/track-shipment';
import { GetPendingShipmentsUseCase } from '@/application/use-cases/shipment/get-pending-shipments';
import { GetUserShipmentsUseCase } from '@/application/use-cases/shipment/get-user-shipments';
import { GetShipmentHistoryUseCase } from '@/application/use-cases/shipment/get-shipment-history';
import { GetAvailableRoutesUseCase } from '@/application/use-cases/route/get-available-routes';
import { GetAvailableTransportersUseCase } from '@/application/use-cases/transporter/get-available-transporters';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { WebSocketService } from '@/domain/ports/services/websocket.service.port';

const logger = createLogger('shipment-controller');

export class ShipmentController {
  constructor(
    private readonly createShipmentUseCase: CreateShipmentUseCase,
    private readonly assignRouteUseCase: AssignRouteUseCase,
    private readonly trackShipmentUseCase: TrackShipmentUseCase,
    private readonly getPendingShipmentsUseCase: GetPendingShipmentsUseCase,
    private readonly getUserShipmentsUseCase: GetUserShipmentsUseCase,
    private readonly getShipmentHistoryUseCase: GetShipmentHistoryUseCase,
    private readonly getAvailableRoutesUseCase: GetAvailableRoutesUseCase,
    private readonly getAvailableTransportersUseCase: GetAvailableTransportersUseCase,
    private readonly webSocketSvc: WebSocketService,
  ) {}

  async createShipment(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req?.user?.userId;
      const shipmentData = req.body;

      const shipment = await this.createShipmentUseCase.execute(
        shipmentData,
        userId,
      );

      res.status(201).json(
        ApiResponse.success({
          message: 'Shipment created successfully',
          shipment,
          tracking: {
            number: shipment.tracking_number,
            url: `/api/v1/shipments/track/${shipment.tracking_number}`,
          },
        }),
      );
    } catch (error) {
      logger.error('Error creating shipment', error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || 'Error creating shipment'));
    }
  }

  async assignRoute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assignmentData = req.body;

      const result = await this.assignRouteUseCase.execute(assignmentData);

      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      logger.error('Error assigning route to shipment', error);
      res
        .status(400)
        .json(
          ApiResponse.error(
            error.message || 'Error assigning route to shipment',
          ),
        );
    }
  }

  async trackShipment(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      const trackingInfo = await this.trackShipmentUseCase.execute(
        trackingNumber,
        userId,
      );

      res.status(200).json(ApiResponse.success(trackingInfo));
    } catch (error) {
      logger.error('Error tracking shipment', error);
      res
        .status(404)
        .json(ApiResponse.error(error.message || 'Error tracking shipment'));
    }
  }

  // async updateShipmentStatus(
  //   req: AuthenticatedRequest,
  //   res: Response,
  // ): Promise<void> {
  //   try {
  //     const { shipmentId } = req.params;
  //     const { newState, location } = req.body;

  //     const result = await this.trackShipmentUseCase.updateShipmentStatus(
  //       parseInt(shipmentId),
  //       newState,
  //       location,
  //     );

  //     res.status(200).json(ApiResponse.success(result));
  //   } catch (error) {
  //     logger.error('Error updating shipment status', error);
  //     res
  //       .status(500)
  //       .json(
  //         ApiResponse.error(error.message || 'Error updating shipment status'),
  //       );
  //   }
  // }

  async getPendingShipments(req: Request, res: Response): Promise<void> {
    try {
      const pendingShipments = await this.getPendingShipmentsUseCase.execute();
      res
        .status(200)
        .json(ApiResponse.success({ shipments: pendingShipments }));
    } catch (error) {
      logger.error('Error fetching pending shipments', error);
      res
        .status(500)
        .json(
          ApiResponse.error(
            error.message || 'Error fetching pending shipments',
          ),
        );
    }
  }

  async getAvailableRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.getAvailableRoutesUseCase.execute();
      res.status(200).json(ApiResponse.success({ routes }));
    } catch (error) {
      logger.error('Error fetching routes', error);
      res
        .status(500)
        .json(ApiResponse.error(error.message || 'Error fetching routes'));
    }
  }

  async getAvailableTransporters(req: Request, res: Response): Promise<void> {
    try {
      const transporters = await this.getAvailableTransportersUseCase.execute();
      res.status(200).json(ApiResponse.success({ transporters }));
    } catch (error) {
      logger.error('Error fetching transporters', error);
      res
        .status(500)
        .json(
          ApiResponse.error(error.message || 'Error fetching transporters'),
        );
    }
  }

  async getUserShipments(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user.userId;

      const shipments = await this.getUserShipmentsUseCase.execute(userId);

      res.status(200).json(ApiResponse.success({ shipments }));
    } catch (error) {
      logger.error('Error fetching user shipments', error);
      res
        .status(500)
        .json(
          ApiResponse.error(error.message || 'Error fetching user shipments'),
        );
    }
  }

  async updateShipmentStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { shipmentId } = req.params;
      const { newState, location, additionalInfo } = req.body;

      const result = await this.trackShipmentUseCase.updateShipmentStatus(
        parseInt(shipmentId),
        newState,
        location,
        additionalInfo,
      );

      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      logger.error('Error updating shipment status', error);
      res
        .status(500)
        .json(
          ApiResponse.error(error.message || 'Error updating shipment status'),
        );
    }
  }

  async getWebSocketStats(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!this.webSocketSvc || !this.webSocketSvc.getStats) {
        throw new Error(
          'WebSocket service not properly initialized or does not support stats',
        );
      }

      const stats = this.webSocketSvc.getStats();

      res.status(200).json(
        ApiResponse.success({
          stats,
          message: 'WebSocket service statistics',
        }),
      );
    } catch (error) {
      logger.error('Error getting WebSocket stats', error);
      res
        .status(500)
        .json(
          ApiResponse.error(
            error.message || 'Error getting WebSocket statistics',
          ),
        );
    }
  }

  async getStatusHistory(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;

      const updates = await this.trackShipmentUseCase.getStatusUpdatesHistory(
        trackingNumber,
      );

      res.status(200).json(
        ApiResponse.success({
          tracking_number: trackingNumber,
          updates,
        }),
      );
    } catch (error) {
      logger.error('Error getting status history', error);
      res
        .status(404)
        .json(
          ApiResponse.error(
            error.message || 'Error getting status updates history',
          ),
        );
    }
  }
}
