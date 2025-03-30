import { Shipment, ShipmentState } from '@/domain/entities/shipment.entity';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('shipment-repository');

export class MysqlShipmentRepository implements ShipmentRepository {
  constructor() {}

  async create(shipment: Partial<Shipment>): Promise<Shipment> {
    try {
      const query = `
        INSERT INTO shipments (
          user_id, 
          transporter_id, 
          route_id, 
          tracking_number, 
          state, 
          date, 
          delivery_date, 
          origin_address, 
          destination_address, 
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        shipment.user_id,
        shipment.transporter_id || null,
        shipment.route_id || null,
        shipment.tracking_number,
        shipment.state,
        shipment.date,
        shipment.delivery_date || null,
        shipment.origin_address,
        shipment.destination_address,
        new Date(),
      ];

      const result = await db.query(query, values);

      const createdShipment: Shipment = {
        id: result.insertId,
        ...(shipment as Shipment),
      };

      return createdShipment;
    } catch (error) {
      logger.error('Error creating shipment', error);
      throw new Error('Error creating shipment: ' + error.message);
    }
  }

  async findById(id: number): Promise<Shipment | null> {
    try {
      const query = `
        SELECT * FROM shipments WHERE id = ?
      `;

      const results = await db.query(query, [id]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as Shipment;
    } catch (error) {
      logger.error(`Error finding shipment by ID: ${id}`, error);
      throw new Error('Error finding shipment: ' + error.message);
    }
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    try {
      const query = `
        SELECT * FROM shipments WHERE tracking_number = ?
      `;

      const results = await db.query(query, [trackingNumber]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as Shipment;
    } catch (error) {
      logger.error(
        `Error finding shipment by tracking number: ${trackingNumber}`,
        error,
      );
      throw new Error('Error finding shipment: ' + error.message);
    }
  }

  async findByUserId(userId: number): Promise<Shipment[]> {
    try {
      const query = `
        SELECT * FROM shipments WHERE user_id = ? ORDER BY created_at DESC
      `;

      const results = await db.query(query, [userId]);

      if (!results || results.length === 0) {
        return [];
      }

      return results as Shipment[];
    } catch (error) {
      logger.error(`Error finding shipments by user ID: ${userId}`, error);
      throw new Error('Error finding shipments: ' + error.message);
    }
  }

  async update(
    id: number,
    shipmentData: Partial<Shipment>,
  ): Promise<Shipment | null> {
    try {
      // Construir la consulta dinámicamente basada en los campos a actualizar
      const fields = Object.keys(shipmentData)
        .filter((key) => key !== 'id' && key !== 'created_at')
        .map((key) => `${key} = ?`);

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push('updated_at = ?');

      const query = `
        UPDATE shipments 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `;

      const values = [
        ...Object.entries(shipmentData)
          .filter(([key]) => key !== 'id' && key !== 'created_at')
          .map(([, value]) => value),
        new Date(),
        id,
      ];

      const result = await db.query(query, values);

      if (!result || result.affectedRows === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating shipment ID: ${id}`, error);
      throw new Error('Error updating shipment: ' + error.message);
    }
  }

  async findByState(state: ShipmentState): Promise<Shipment[]> {
    try {
      const query = `
        SELECT * FROM shipments WHERE state = ? ORDER BY date DESC
      `;

      const results = await db.query(query, [state]);

      if (!results || results.length === 0) {
        return [];
      }

      return results as Shipment[];
    } catch (error) {
      logger.error(`Error finding shipments by state: ${state}`, error);
      throw new Error('Error finding shipments: ' + error.message);
    }
  }

  async findByTransporterAndState(
    transporterId: number,
    state: ShipmentState,
  ): Promise<Shipment[]> {
    try {
      const query = `
        SELECT * FROM shipments 
        WHERE transporter_id = ? AND state = ?
      `;

      const results = await db.query(query, [transporterId, state]);

      if (!results || results.length === 0) {
        return [];
      }

      return results as Shipment[];
    } catch (error) {
      logger.error(`Error finding shipments by transporter and state`, error);
      throw new Error('Error finding shipments: ' + error.message);
    }
  }
}
