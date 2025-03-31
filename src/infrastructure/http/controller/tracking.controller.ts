import { Request, Response } from 'express';
import { createLogger } from '@/infrastructure/logger';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { TrackShipmentUseCase } from '@/application/use-cases/shipment/track-shipment';
import { UpdateShipmentStatusUseCase } from '@/application/use-cases/shipment/update-shipment-status';
import { ShipmentHistoryUseCase } from '@/application/use-cases/shipment/get-shipment-history';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.errors';

const logger = createLogger('tracking-controller');

export class TrackingController {
  constructor(
    private readonly trackShipmentUseCase: TrackShipmentUseCase,
    private readonly updateShipmentStatusUseCase: UpdateShipmentStatusUseCase,
    private readonly shipmentHistoryUseCase: ShipmentHistoryUseCase,
  ) {}

  /**
   * @swagger
   * /shipments/track/{trackingNumber}:
   *   get:
   *     summary: Rastrear un envío por número de seguimiento
   *     description: Obtiene información detallada del estado actual de un envío
   *     tags: [Tracking]
   *     parameters:
   *       - in: path
   *         name: trackingNumber
   *         required: true
   *         schema:
   *           type: string
   *           pattern: '^[0-9]{8}$'
   *         description: Número de seguimiento de 8 dígitos
   *         example: "12345678"
   *     responses:
   *       200:
   *         description: Información detallada del envío
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     shipment:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 123
   *                         tracking_number:
   *                           type: string
   *                           example: "12345678"
   *                         state:
   *                           type: string
   *                           enum: ["En espera", "En tránsito", "Entregado"]
   *                           example: "En tránsito"
   *                         date:
   *                           type: string
   *                           format: date-time
   *                         delivery_date:
   *                           type: string
   *                           format: date-time
   *                           nullable: true
   *                         origin_address:
   *                           type: string
   *                         destination_address:
   *                           type: string
   *                     package:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                         weight:
   *                           type: number
   *                         size:
   *                           type: string
   *                         type_of_product:
   *                           type: string
   *                         description:
   *                           type: string
   *                         value:
   *                           type: number
   *                     status_history:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                           shipment_id:
   *                             type: integer
   *                           status:
   *                             type: string
   *                           location:
   *                             type: string
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *       400:
   *         description: Número de seguimiento inválido
   *       404:
   *         description: Envío no encontrado
   *       500:
   *         description: Error del servidor
   */
  async trackShipment(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!trackingNumber || trackingNumber.length !== 8) {
        throw new ValidationError(
          'Valid tracking number is required (8 digits)',
        );
      }

      const trackingInfo = await this.trackShipmentUseCase.execute(
        trackingNumber,
        userId,
      );

      if (!trackingInfo) {
        throw new NotFoundError('Shipment', trackingNumber);
      }

      res.status(200).json(ApiResponse.success(trackingInfo));
    } catch (error) {
      logger.error('Error tracking shipment', error);

      if (error instanceof NotFoundError) {
        res.status(404).json(ApiResponse.error(error.message));
      } else if (error instanceof ValidationError) {
        res.status(400).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(ApiResponse.error(error.message || 'Error tracking shipment'));
      }
    }
  }

  /**
   * @swagger
   * /shipments/{shipmentId}/status:
   *   put:
   *     summary: Actualizar el estado de un envío
   *     description: Cambia el estado actual de un envío y registra su ubicación. Solo para administradores y conductores.
   *     tags: [Tracking]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shipmentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del envío
   *         example: 123
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - newState
   *               - location
   *             properties:
   *               newState:
   *                 type: string
   *                 enum: ["En espera", "En tránsito", "Entregado"]
   *                 example: "En tránsito"
   *                 description: Nuevo estado del envío
   *               location:
   *                 type: string
   *                 example: "Carretera 25, Km 80, Antioquia"
   *                 description: Ubicación actual del envío
   *               additionalInfo:
   *                 type: string
   *                 example: "Retraso por condiciones climáticas"
   *                 description: Información adicional sobre la actualización
   *     responses:
   *       200:
   *         description: Estado actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Shipment status updated successfully"
   *                     shipment:
   *                       type: object
   *                     status:
   *                       type: object
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador o conductor)
   *       404:
   *         description: Envío no encontrado
   *       500:
   *         description: Error del servidor
   */
  async updateShipmentStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { shipmentId } = req.params;
      const { newState, location, additionalInfo } = req.body;

      if (!shipmentId || !newState || !location) {
        throw new ValidationError(
          'Shipment ID, new state, and location are required',
        );
      }

      const result = await this.updateShipmentStatusUseCase.execute(
        parseInt(shipmentId),
        newState,
        location,
        additionalInfo,
      );

      // Registrar el usuario que realizó la actualización
      logger.info(
        `Shipment ${shipmentId} status updated to ${newState} by user ${req.user.userId}`,
      );

      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      logger.error('Error updating shipment status', error);

      if (error instanceof NotFoundError) {
        res.status(404).json(ApiResponse.error(error.message));
      } else if (error instanceof ValidationError) {
        res.status(400).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(
              error.message || 'Error updating shipment status',
            ),
          );
      }
    }
  }

  /**
   * @swagger
   * /shipments/history/{trackingNumber}:
   *   get:
   *     summary: Obtener historial de estados de un envío
   *     description: Recupera el historial completo de actualizaciones de estado de un envío
   *     tags: [Tracking]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: trackingNumber
   *         required: false
   *         schema:
   *           type: string
   *         description: Número de seguimiento del envío
   *       - in: query
   *         name: shipmentId
   *         required: false
   *         schema:
   *           type: integer
   *         description: ID del envío (alternativa al número de seguimiento)
   *     responses:
   *       200:
   *         description: Historial de actualizaciones de estado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     tracking_number:
   *                       type: string
   *                       example: "12345678"
   *                     updates:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           tracking_number:
   *                             type: string
   *                           state:
   *                             type: string
   *                           location:
   *                             type: string
   *                           timestamp:
   *                             type: string
   *                             format: date-time
   *       400:
   *         description: Parámetros inválidos
   *       401:
   *         description: No autenticado
   *       404:
   *         description: Envío no encontrado
   *       500:
   *         description: Error del servidor
   */
  async getStatusHistory(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;
      const shipmentId = req.query.shipmentId as string;

      if (!trackingNumber && !shipmentId) {
        throw new ValidationError(
          'Either tracking number or shipment ID must be provided',
        );
      }

      let updates;

      if (trackingNumber) {
        updates = await this.shipmentHistoryUseCase.executeByTrackingNumber(
          trackingNumber,
        );

        res.status(200).json(
          ApiResponse.success({
            tracking_number: trackingNumber,
            updates,
          }),
        );
      } else if (shipmentId) {
        updates = await this.shipmentHistoryUseCase.executeById(
          parseInt(shipmentId),
        );

        res.status(200).json(
          ApiResponse.success({
            shipment_id: parseInt(shipmentId),
            updates,
          }),
        );
      }
    } catch (error) {
      logger.error('Error getting status history', error);

      if (error instanceof NotFoundError) {
        res.status(404).json(ApiResponse.error(error.message));
      } else if (error instanceof ValidationError) {
        res.status(400).json(ApiResponse.error(error.message));
      } else {
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
}
