import { OrderStatus } from '@/domain/entities/order-status.entity';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('order-status-repository');

export interface OrderStatusRepository {
  create(statusData: Partial<OrderStatus>): Promise<OrderStatus>;
  findByShipmentId(shipmentId: number): Promise<OrderStatus[]>;
}

export class MysqlOrderStatusRepository implements OrderStatusRepository {
  constructor() {}

  async create(statusData: Partial<OrderStatus>): Promise<OrderStatus> {
    try {
      const query = `
        INSERT INTO order_status (
          shipment_id, 
          status, 
          location, 
          created_at
        )
        VALUES (?, ?, ?, ?)
      `;

      const values = [
        statusData.shipment_id,
        statusData.status,
        statusData.location || null,
        new Date(),
      ];

      const result = await db.query(query, values);

      const createdStatus: OrderStatus = {
        id: result.insertId,
        ...(statusData as OrderStatus),
        created_at: new Date(),
      };

      return createdStatus;
    } catch (error) {
      logger.error('Error creating order status', error);
      throw new Error('Error creating order status: ' + error.message);
    }
  }

  async findByShipmentId(shipmentId: number): Promise<OrderStatus[]> {
    try {
      const query = `
        SELECT * FROM order_status 
        WHERE shipment_id = ? 
        ORDER BY created_at DESC
      `;

      const results = await db.query(query, [shipmentId]);

      if (!results || results.length === 0) {
        return [];
      }

      return results as OrderStatus[];
    } catch (error) {
      logger.error(
        `Error finding order status by shipment ID: ${shipmentId}`,
        error,
      );
      throw new Error('Error finding order status: ' + error.message);
    }
  }
}
