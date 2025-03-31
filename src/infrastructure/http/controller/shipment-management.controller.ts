import { Request, Response } from 'express';
import { createLogger } from '@/infrastructure/logger';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { CreateShipmentUseCase } from '@/application/use-cases/shipment/create';
import { AssignRouteUseCase } from '@/application/use-cases/route/assign-route';
import { GetUserShipmentsUseCase } from '@/application/use-cases/shipment/get-user-shipments';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  InsufficientCapacityError,
} from '@/domain/errors/domain.errors';
import { validateAddress } from '@/infrastructure/utils/address-validator';
import { GetAllShipmentsUseCase } from '@/application/use-cases/shipment/get-all-shipments';
import { ShipmentState } from '@/domain/entities/shipment.entity';
import { GetByIdShipmentsUseCase } from '@/application/use-cases/shipment/get-by-id-shipment';

const logger = createLogger('shipment-management-controller');

export class ShipmentManagementController {
  constructor(
    private readonly createShipmentUseCase: CreateShipmentUseCase,
    private readonly assignRouteUseCase: AssignRouteUseCase,
    private readonly getUserShipmentsUseCase: GetUserShipmentsUseCase,
    private readonly getAllShipmentsUseCase: GetAllShipmentsUseCase,
    private readonly getByIdShipmentUseCase: GetByIdShipmentsUseCase,
  ) {}

  /**
   * @swagger
   * /shipments:
   *   post:
   *     summary: Crear un nuevo envío
   *     description: Crea un nuevo envío asociado al usuario autenticado
   *     tags: [Shipments]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - origin_address
   *               - destination_address
   *               - package
   *             properties:
   *               origin_address:
   *                 type: string
   *                 description: Dirección de origen
   *                 example: "Calle 123 #45-67, Medellín"
   *               destination_address:
   *                 type: string
   *                 description: Dirección de destino
   *                 example: "Avenida 89 #12-34, Bogotá"
   *               package:
   *                 type: object
   *                 required:
   *                   - weight
   *                   - size
   *                   - type_of_product
   *                   - value
   *                 properties:
   *                   weight:
   *                     type: number
   *                     format: float
   *                     description: Peso del paquete en kg
   *                     example: 5.2
   *                   size:
   *                     type: string
   *                     description: Dimensiones del paquete
   *                     example: "30x20x15 cm"
   *                   type_of_product:
   *                     type: string
   *                     description: Tipo de producto
   *                     example: "Electrónica"
   *                   description:
   *                     type: string
   *                     description: Descripción del contenido
   *                     example: "Laptop nueva en caja"
   *                   value:
   *                     type: number
   *                     description: Valor declarado del paquete en la moneda local
   *                     example: 1200000
   *     responses:
   *       201:
   *         description: Envío creado exitosamente
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
   *                       example: "Shipment created successfully"
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
   *                           example: "En espera"
   *                     tracking:
   *                       type: object
   *                       properties:
   *                         number:
   *                           type: string
   *                           example: "12345678"
   *                         url:
   *                           type: string
   *                           example: "/api/v1/shipments/track/12345678"
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       500:
   *         description: Error del servidor
   */
  async createShipment(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req?.user?.userId;
      const shipmentData = req.body;

      const isValidOriginAddress = await validateAddress(
        shipmentData.origin_address,
      );

      if (!isValidOriginAddress) {
        throw new Error('Invalid origin address');
      }

      const isValidDestinationAddress = await validateAddress(
        shipmentData.destination_address,
      );

      if (!isValidDestinationAddress) {
        throw new Error('Invalid destination address');
      }

      const shipment = await this.createShipmentUseCase.execute(
        shipmentData,
        userId,
      );

      logger.info(
        `New shipment created by user ${userId} with tracking number ${shipment.tracking_number}`,
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

      if (error instanceof ValidationError) {
        res.status(400).json(ApiResponse.error(error.message));
      } else if (error instanceof ForbiddenError) {
        res.status(403).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(ApiResponse.error(error.message || 'Error creating shipment'));
      }
    }
  }

  /**
   * @swagger
   * /shipments/assign:
   *   post:
   *     summary: Asignar un envío a una ruta y transportista
   *     description: Asigna un envío que está en espera a una ruta y transportista específicos. Solo para administradores.
   *     tags: [Shipments]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - shipment_id
   *               - route_id
   *               - transporter_id
   *             properties:
   *               shipment_id:
   *                 type: integer
   *                 description: ID del envío a asignar
   *                 example: 123
   *               route_id:
   *                 type: integer
   *                 description: ID de la ruta a asignar
   *                 example: 5
   *               transporter_id:
   *                 type: integer
   *                 description: ID del transportista a asignar
   *                 example: 10
   *     responses:
   *       200:
   *         description: Envío asignado exitosamente
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
   *                       example: "Shipment successfully assigned to route and transporter"
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
   *                           example: "En tránsito"
   *                         transporter:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                               example: 10
   *                             name:
   *                               type: string
   *                               example: "Juan Pérez"
   *                             plate:
   *                               type: string
   *                               example: "ABC123"
   *                         route:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: integer
   *                               example: 5
   *                             name:
   *                               type: string
   *                               example: "Medellín - Bogotá"
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (solo administradores)
   *       404:
   *         description: Envío, ruta o transportista no encontrado
   *       422:
   *         description: Estado del envío inválido, transportista no disponible o capacidad insuficiente
   *       500:
   *         description: Error del servidor
   */
  async assignRoute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const assignmentData = req.body;

      const result = await this.assignRouteUseCase.execute(assignmentData);

      logger.info(
        `Shipment ${assignmentData.shipment_id} assigned to route ${assignmentData.route_id} and transporter ${assignmentData.transporter_id} by user ${req.user.userId}`,
      );

      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      logger.error('Error assigning route to shipment', error);

      if (error instanceof NotFoundError) {
        res.status(404).json(ApiResponse.error(error.message));
      } else if (error instanceof ValidationError) {
        res.status(400).json(ApiResponse.error(error.message));
      } else if (error instanceof InsufficientCapacityError) {
        res.status(422).json(ApiResponse.error(error.message));
      } else {
        res
          .status(400)
          .json(
            ApiResponse.error(
              error.message || 'Error assigning route to shipment',
            ),
          );
      }
    }
  }

  // /**
  //  * @swagger
  //  * /shipments/pending:
  //  *   get:
  //  *     summary: Obtener envíos pendientes
  //  *     description: Recupera todos los envíos en estado "En espera" que aún no han sido asignados a una ruta y transportista. Solo para administradores.
  //  *     tags: [Shipments]
  //  *     security:
  //  *       - BearerAuth: []
  //  *     responses:
  //  *       200:
  //  *         description: Lista de envíos pendientes
  //  *         content:
  //  *           application/json:
  //  *             schema:
  //  *               type: object
  //  *               properties:
  //  *                 status:
  //  *                   type: string
  //  *                   example: "success"
  //  *                 data:
  //  *                   type: object
  //  *                   properties:
  //  *                     shipments:
  //  *                       type: array
  //  *                       items:
  //  *                         type: object
  //  *                         properties:
  //  *                           id:
  //  *                             type: integer
  //  *                             example: 123
  //  *                           tracking_number:
  //  *                             type: string
  //  *                             example: "12345678"
  //  *                           state:
  //  *                             type: string
  //  *                             example: "En espera"
  //  *                           date:
  //  *                             type: string
  //  *                             format: date-time
  //  *                             example: "2023-03-15T14:30:00Z"
  //  *                           origin_address:
  //  *                             type: string
  //  *                             example: "Calle 123 #45-67, Medellín"
  //  *                           destination_address:
  //  *                             type: string
  //  *                             example: "Avenida 89 #12-34, Bogotá"
  //  *       401:
  //  *         description: No autenticado
  //  *       403:
  //  *         description: No autorizado (solo administradores)
  //  *       500:
  //  *         description: Error del servidor
  //  */
  // async getPendingShipments(req: Request, res: Response): Promise<void> {
  //   try {
  //     const pendingShipments = await this.getPendingShipmentsUseCase.execute();

  //     res
  //       .status(200)
  //       .json(ApiResponse.success({ shipments: pendingShipments }));
  //   } catch (error) {
  //     logger.error('Error fetching pending shipments', error);

  //     res
  //       .status(500)
  //       .json(
  //         ApiResponse.error(
  //           error.message || 'Error fetching pending shipments',
  //         ),
  //       );
  //   }
  // }

  /**
   * @swagger
   * /shipments/my-shipments:
   *   get:
   *     summary: Obtener envíos del usuario autenticado
   *     description: Recupera todos los envíos creados por el usuario actualmente autenticado
   *     tags: [Shipments]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de envíos del usuario
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
   *                     shipments:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 123
   *                           tracking_number:
   *                             type: string
   *                             example: "12345678"
   *                           state:
   *                             type: string
   *                             enum: ["En espera", "En tránsito", "Entregado"]
   *                             example: "En tránsito"
   *                           date:
   *                             type: string
   *                             format: date-time
   *                           delivery_date:
   *                             type: string
   *                             format: date-time
   *                             nullable: true
   *                           origin_address:
   *                             type: string
   *                           destination_address:
   *                             type: string
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       500:
   *         description: Error del servidor
   */
  async getUserShipments(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user.userId;

      if (!userId) {
        throw new ForbiddenError('Valid user authentication is required');
      }

      const shipments = await this.getUserShipmentsUseCase.execute(userId);

      res.status(200).json(ApiResponse.success({ shipments }));
    } catch (error) {
      logger.error('Error fetching user shipments', error);

      if (error instanceof ForbiddenError) {
        res.status(403).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(error.message || 'Error fetching user shipments'),
          );
      }
    }
  }

  async getAllShipments(req: Request, res: Response): Promise<void> {
    try {
      const { state } = req.query;
      const shipments = await this.getAllShipmentsUseCase.execute(state as ShipmentState);

      res.status(200).json(ApiResponse.success({ shipments }));
    } catch (error) {
      logger.error('Error fetching all shipments', error);

      if (error instanceof ForbiddenError) {
        res.status(403).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(error.message || 'Error fetching all shipments'),
          );
      }
    }
  }

  async getByIdShipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const shipment = await this.getByIdShipmentUseCase.execute(+id);

      res.status(200).json(ApiResponse.success({ shipment }));
    } catch (error) {
      logger.error('Error fetching shipment', error);

      if (error instanceof ForbiddenError) {
        res.status(403).json(ApiResponse.error(error.message));
      } else {
        res
          .status(500)
          .json(
            ApiResponse.error(error.message || 'Error fetching shipment'),
          );
      }
    }
  }
}
