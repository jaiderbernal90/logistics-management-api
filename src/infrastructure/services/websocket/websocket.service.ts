import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
  WebSocketService as IWebSocketService,
  WebSocketMessage,
} from '@/domain/ports/services/websocket.service.port';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('websocket-service');

export class WebSocketService implements IWebSocketService {
  private io: Server;
  private static instance: WebSocketService;
  private readonly trackingRooms = new Map<string, number>();

  private constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupSocketEvents();
    logger.info('WebSocket service initialized');
  }

  private setupSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('subscribe', (trackingNumber: string) => {
        logger.info(
          `Client ${socket.id} subscribed to tracking: ${trackingNumber}`,
        );

        socket.join(`tracking:${trackingNumber}`);

        // Incrementar contador de clientes para este tracking
        const currentCount = this.trackingRooms.get(trackingNumber) || 0;
        this.trackingRooms.set(trackingNumber, currentCount + 1);

        // Emitir evento de conexión exitosa al cliente
        socket.emit('subscribed', {
          trackingNumber,
          message: 'Subscription successful',
        });
      });

      socket.on('unsubscribe', (trackingNumber: string) => {
        logger.info(
          `Client ${socket.id} unsubscribed from tracking: ${trackingNumber}`,
        );

        socket.leave(`tracking:${trackingNumber}`);

        // Decrementar contador de clientes para este tracking
        const currentCount = this.trackingRooms.get(trackingNumber) || 0;
        if (currentCount > 1) {
          this.trackingRooms.set(trackingNumber, currentCount - 1);
        } else {
          this.trackingRooms.delete(trackingNumber);
        }

        socket.emit('unsubscribed', {
          trackingNumber,
          message: 'Unsubscription successful',
        });
      });

      socket.on('error', (error) => {
        logger.error(`Socket error for client ${socket.id}:`, error);
      });

      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
        // Las suscripciones se limpian automáticamente cuando el socket se desconecta
      });
    });
  }

  public static getInstance(server?: HTTPServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  public notifyStatusUpdate(
    trackingNumber: string,
    data: WebSocketMessage,
  ): void {
    if (!this.trackingRooms.has(trackingNumber)) {
      logger.info(
        `No active listeners for tracking: ${trackingNumber}, skipping notification`,
      );
      return;
    }

    const roomName = `tracking:${trackingNumber}`;
    this.io.to(roomName).emit('status-update', data);
    logger.info(
      `Status update broadcast for: ${trackingNumber} to ${this.trackingRooms.get(
        trackingNumber,
      )} clients`,
    );
  }

  public hasActiveListeners(trackingNumber: string): boolean {
    return (
      this.trackingRooms.has(trackingNumber) &&
      this.trackingRooms.get(trackingNumber) > 0
    );
  }

  public getStats(): any {
    return {
      totalConnections: this.io.engine.clientsCount,
      activeTrackingRooms: Object.fromEntries(this.trackingRooms),
    };
  }
}
