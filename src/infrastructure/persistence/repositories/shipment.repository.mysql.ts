import { Shipment, ShipmentState } from '@/domain/entities/shipment.entity';
import { ShipmentRepository } from '@/domain/ports/repositories/shipment.repository.port';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';
import {
  ShipmentAdvancedFilter,
  ShipmentDetailedView,
  TransporterPerformanceFilter,
  TransporterPerformanceSummary,
} from '@/domain/interfaces/reports.interface';
import { Page, PageImpl, PageRequest } from '@/domain/interfaces/pagination.interface';

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

  async findAll(state: ShipmentState): Promise<Shipment[]> {
    try {
      const query = `
       SELECT 
          s.*,
          p.id as package_id,
          p.weight as package_weight,
          p.size as package_size,
          p.type_of_product as package_type,
          p.description as package_description,
          p.value as package_value,
          u.name as user_name, 
          t.name as transporter_name, 
          r.name as route_name
        FROM shipments s
        LEFT JOIN packages p ON s.id = p.shipment_id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN transporters t ON s.transporter_id = t.id
        LEFT JOIN routes r ON s.route_id = r.id
        ${state ? `WHERE s.state = '${state}'` : ''}
      `;

      const results = await db.query(query);

      if (!results || results.length === 0) {
        return [];
      }

      return results as Shipment[];
    } catch (error) {
      logger.error('Error finding all shipments', error);
      throw new Error('Error finding shipments: ' + error.message);
    }
  }

  async getTransportersPerformance(
    filter: TransporterPerformanceFilter,
  ): Promise<TransporterPerformanceSummary> {
    try {
      let startDate = filter.startDate
        ? new Date(filter.startDate)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
        : undefined;
      let endDate = filter.endDate
        ? new Date(filter.endDate).toISOString().slice(0, 19).replace('T', ' ')
        : undefined;

      let whereClause = '';
      const params: any[] = [];

      if (startDate) {
        whereClause += ' AND s.date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND s.date <= ?';
        params.push(endDate);
      }

      const query = `
        SELECT 
          t.id as transporter_id,
          t.name as transporter_name,
          COUNT(s.id) as total_shipments,
          SUM(CASE WHEN s.state = '${ShipmentState.ENTREGADO}' THEN 1 ELSE 0 END) as completed_shipments,
          AVG(CASE 
            WHEN s.state = '${ShipmentState.ENTREGADO}' AND s.delivery_date IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, s.date, s.delivery_date) 
            ELSE NULL 
          END) as avg_delivery_time_hours
        FROM 
          transporters t
        LEFT JOIN 
          shipments s ON t.id = s.transporter_id
        WHERE 
          1=1 ${whereClause}
        GROUP BY 
          t.id, t.name
        ORDER BY 
          avg_delivery_time_hours ASC
      `;

      const overallQuery = `
        SELECT 
          COUNT(id) as total_shipments,
          AVG(CASE 
            WHEN state = '${ShipmentState.ENTREGADO}' AND delivery_date IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, date, delivery_date) 
            ELSE NULL 
          END) as overall_avg_delivery_time
        FROM 
          shipments s
        WHERE 
          1=1 ${whereClause}
      `;

      const [transportersResults, overallResults] = await Promise.all([
        db.query(query, params),
        db.query(overallQuery, params),
      ]);

      const transporters = transportersResults.map((row: any) => ({
        transporterId: row.transporter_id,
        transporterName: row.transporter_name,
        totalShipments: row.total_shipments || 0,
        completedShipments: row.completed_shipments || 0,
        avgDeliveryTimeHours: row.avg_delivery_time_hours || 0,
        onTimePercentage:
          row.total_shipments > 0
            ? (row.completed_shipments / row.total_shipments) * 100
            : 0,
      }));

      const overallRow = overallResults[0];

      return {
        transporters,
        overallAvgDeliveryTime: overallRow.overall_avg_delivery_time || 0,
        totalShipments: overallRow.total_shipments || 0,
      };
    } catch (error) {
      logger.error('Error getting transporters performance', error);
      throw new Error(
        'Error getting transporters performance: ' + error.message,
      );
    }
  }

  async findShipmentsAdvanced(
    filter: ShipmentAdvancedFilter,
    pageRequest: PageRequest,
  ): Promise<Page<ShipmentDetailedView>> {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (filter.startDate) {
        whereClause += ' AND s.date >= ?';
        params.push(
          new Date(filter.startDate)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        );
      }

      if (filter.endDate) {
        whereClause += ' AND s.date <= ?';
        params.push(
          new Date(filter.endDate).toISOString().slice(0, 19).replace('T', ' '),
        );
      }

      if (filter.state) {
        whereClause += ' AND s.state = ?';
        params.push(filter.state);
      }

      if (filter.transporterId) {
        whereClause += ' AND s.transporter_id = ?';
        params.push(filter.transporterId);
      }

      if (filter.routeId) {
        whereClause += ' AND s.route_id = ?';
        params.push(filter.routeId);
      }

      const baseQuery = `
        SELECT 
          s.id,
          s.tracking_number,
          s.state,
          s.date,
          s.delivery_date,
          s.origin_address,
          s.destination_address,
          s.transporter_id,
          t.name AS transporter_name,
          s.route_id,
          r.name AS route_name,
          s.user_id,
          u.name AS user_name,
          p.weight AS package_weight,
          p.size AS package_size,
          p.type_of_product AS package_type,
          p.value AS package_value,
          CASE 
            WHEN s.delivery_date IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, s.date, s.delivery_date) 
            ELSE NULL 
          END AS delivery_time
        FROM 
          shipments s
        LEFT JOIN 
          users u ON s.user_id = u.id
        LEFT JOIN 
          transporters t ON s.transporter_id = t.id
        LEFT JOIN 
          routes r ON s.route_id = r.id
        LEFT JOIN 
          packages p ON s.id = p.shipment_id
        WHERE 
          1=1 ${whereClause}
      `;

      const countQuery = `SELECT COUNT(*) AS total FROM shipments s WHERE 1=1 ${whereClause}`;
      const [countResult] = await db.query(countQuery, params);
      const total = countResult.total;

      const limit = Number(pageRequest.limit);
      const offset = Number((pageRequest.page - 1) * limit);

      const paginatedQuery = `${baseQuery} ORDER BY s.date DESC LIMIT ${limit} OFFSET ${offset}`;

      const results = await db.query(paginatedQuery, params);

      const shipments = results.map((row: any) => ({
        id: row.id,
        trackingNumber: row.tracking_number,
        state: row.state,
        date: row.date,
        deliveryDate: row.delivery_date,
        originAddress: row.origin_address,
        destinationAddress: row.destination_address,
        transporterId: row.transporter_id,
        transporterName: row.transporter_name,
        routeId: row.route_id,
        routeName: row.route_name,
        userId: row.user_id,
        userName: row.user_name,
        packageInfo: row.package_weight
          ? {
              weight: row.package_weight,
              size: row.package_size,
              typeOfProduct: row.package_type,
              value: row.package_value,
            }
          : undefined,
        deliveryTime: row.delivery_time,
      }));

      return new PageImpl<ShipmentDetailedView>(shipments, total, pageRequest);
    } catch (error) {
      logger.error('Error finding shipments with advanced filters', error);
      throw new Error('Error finding shipments: ' + error.message);
    }
  }
}
