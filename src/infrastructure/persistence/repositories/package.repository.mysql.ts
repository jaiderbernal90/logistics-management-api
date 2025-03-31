import { CreatePackageDto } from '@/application/dtos/package/package.dto';
import { Package } from '@/domain/entities/package.entity';
import { PackageRepository } from '@/domain/ports/repositories/package.repository.port';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('package-repository');

export class MysqlPackageRepository implements PackageRepository {
  constructor() {}

  async create(
    packageData: CreatePackageDto,
    userId: number,
    shipmentId?: number,
  ): Promise<Package> {
    try {
      logger.info(
        `Creating package for user ID: ${userId} and shipment ID: ${
          shipmentId || 'undefined'
        }`,
      );
      logger.info(`Package data: ${JSON.stringify(packageData)}`);

      let description = packageData.description;
      if (description === undefined) {
        description = null;
      }

      let value = packageData.value;
      if (typeof value === 'string') {
        value = parseFloat(value);
      }

      const query = `
        INSERT INTO packages (
          weight, 
          size, 
          type_of_product, 
          description, 
          value, 
          user_id, 
          shipment_id, 
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        packageData.weight,
        packageData.size,
        packageData.type_of_product,
        description,
        value,
        userId,
        shipmentId || null,
        new Date(),
      ];

      const result = await db.query(query, values);

      const createdPackage: Package = {
        id: result.insertId,
        weight: packageData.weight,
        size: packageData.size,
        type_of_product: packageData.type_of_product,
        description: description || '',
        value: value as number,
        user_id: userId,
        shipment_id: shipmentId || null,
        created_at: new Date(),
      };

      logger.info(`Package created successfully with ID: ${createdPackage.id}`);
      return createdPackage;
    } catch (error) {
      logger.error('Error creating package', error);
      throw new Error('Error creating package: ' + error.message);
    }
  }

  async findById(id: number): Promise<Package | null> {
    try {
      const query = `
        SELECT * FROM packages WHERE id = ?
      `;

      const results = await db.query(query, [id]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as Package;
    } catch (error) {
      logger.error(`Error finding package by ID: ${id}`, error);
      throw new Error('Error finding package: ' + error.message);
    }
  }

  async findByShipmentId(shipmentId: number): Promise<Package | null> {
    try {
      const query = `
        SELECT * FROM packages WHERE shipment_id = ?
      `;

      const results = await db.query(query, [shipmentId]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as Package;
    } catch (error) {
      logger.error(
        `Error finding package by shipment ID: ${shipmentId}`,
        error,
      );
      throw new Error('Error finding package: ' + error.message);
    }
  }

  async findByUserId(userId: number): Promise<Package[]> {
    try {
      const query = `
        SELECT * FROM packages WHERE user_id = ?
      `;

      const results = await db.query(query, [userId]);

      if (!results || results.length === 0) {
        return [];
      }

      return results as Package[];
    } catch (error) {
      logger.error(`Error finding packages by user ID: ${userId}`, error);
      throw new Error('Error finding packages: ' + error.message);
    }
  }

  async update(
    id: number,
    packageData: Partial<Package>,
  ): Promise<Package | null> {
    try {
      // Construir la consulta dinámicamente basada en los campos a actualizar
      const fields = Object.keys(packageData)
        .filter((key) => key !== 'id' && key !== 'created_at')
        .map((key) => `${key} = ?`);

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      // Añadir updated_at al conjunto de campos a actualizar
      fields.push('updated_at = ?');

      const query = `
        UPDATE packages 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `;

      // Preparar los valores para la consulta
      const values = [
        ...Object.entries(packageData)
          .filter(([key]) => key !== 'id' && key !== 'created_at')
          .map(([, value]) => value),
        new Date(), // updated_at
        id,
      ];

      const result = await db.query(query, values);

      if (!result || result.affectedRows === 0) {
        return null;
      }

      // Obtener el paquete actualizado
      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating package ID: ${id}`, error);
      throw new Error('Error updating package: ' + error.message);
    }
  }
}
