import { Request, Response } from 'express';
import { createLogger } from '@/infrastructure/logger';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { GetAvailableRoutesUseCase } from '@/application/use-cases/route/get-available-routes';
import { GetAvailableTransportersUseCase } from '@/application/use-cases/transporter/get-available-transporters';
import { WebSocketService } from '@/domain/ports/services/websocket.service.port';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const logger = createLogger('route-transporter-controller');

export class RouteTransporterController {
  constructor(
    private readonly getAvailableRoutesUseCase: GetAvailableRoutesUseCase,
    private readonly getAvailableTransportersUseCase: GetAvailableTransportersUseCase,
    private readonly webSocketSvc: WebSocketService,
  ) {}

  /**
   * @swagger
   * /shipments/routes:
   *   get:
   *     summary: Obtener todas las rutas disponibles
   *     description: Recupera el listado de todas las rutas configuradas en el sistema
   *     tags: [Routes]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de rutas disponibles
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
   *                     routes:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           name:
   *                             type: string
   *                             example: "Medellín - Bogotá"
   *                           origin:
   *                             type: string
   *                             example: "Medellín"
   *                           destination:
   *                             type: string
   *                             example: "Bogotá"
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *       401:
   *         description: No autenticado
   *       500:
   *         description: Error del servidor
   */
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

  /**
   * @swagger
   * /shipments/transporters:
   *   get:
   *     summary: Obtener transportistas disponibles
   *     description: Recupera el listado de transportistas que están disponibles para asignarles envíos. Solo para administradores.
   *     tags: [Transporters]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de transportistas disponibles
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
   *                     transporters:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           name:
   *                             type: string
   *                             example: "Juan Pérez"
   *                           user_id:
   *                             type: integer
   *                             example: 5
   *                           capacity:
   *                             type: number
   *                             example: 1500
   *                           vehicle_type:
   *                             type: string
   *                             example: "Camión"
   *                           plate:
   *                             type: string
   *                             example: "ABC123"
   *                           is_available:
   *                             type: boolean
   *                             example: true
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (solo administradores)
   *       500:
   *         description: Error del servidor
   */
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

  /**
   * @swagger
   * /shipments/websocket-stats:
   *   get:
   *     summary: Obtener estadísticas de WebSocket
   *     description: Recupera estadísticas sobre las conexiones WebSocket activas y las suscripciones a seguimiento en tiempo real. Solo para administradores.
   *     tags: [Administration]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas de WebSocket
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
   *                     stats:
   *                       type: object
   *                       properties:
   *                         totalConnections:
   *                           type: integer
   *                           description: Número total de conexiones actuales
   *                           example: 15
   *                         activeTrackingRooms:
   *                           type: object
   *                           description: Número de seguidores activos por tracking_number
   *                           example: {"12345678": 2, "87654321": 1}
   *                     message:
   *                       type: string
   *                       example: "WebSocket service statistics"
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (solo administradores)
   *       500:
   *         description: Error del servidor
   */
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
}
