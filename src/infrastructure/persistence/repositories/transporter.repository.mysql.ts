import { TransporterDto } from '@/application/dtos/transporter/transporter.dto';
import { TransporterRepository } from '@/domain/ports/repositories/transporter.repository.port';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('transporter-repository');

export class MysqlTransporterRepository implements TransporterRepository {
  async findById(id: number): Promise<TransporterDto | null> {
    try {
      const query = `SELECT * FROM transporters WHERE id = ?`;
      const results = await db.query(query, [id]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as TransporterDto;
    } catch (error) {
      logger.error(`Error finding transporter by ID: ${id}`, error);
      throw new Error('Error finding transporter: ' + error.message);
    }
  }

  async findAvailable(): Promise<TransporterDto[]> {
    try {
      const query = `SELECT * FROM transporters WHERE is_available = true ORDER BY name`;
      const results = await db.query(query);

      if (!results || results.length === 0) {
        return [];
      }

      return results as TransporterDto[];
    } catch (error) {
      logger.error('Error finding available transporters', error);
      throw new Error('Error finding transporters: ' + error.message);
    }
  }

  async updateAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<TransporterDto | null> {
    try {
      const query = `
        UPDATE transporters 
        SET is_available = ?, updated_at = ? 
        WHERE id = ?
      `;

      const result = await db.query(query, [isAvailable, new Date(), id]);

      if (!result || result.affectedRows === 0) {
        return null;
      }

      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating transporter availability: ${id}`, error);
      throw new Error('Error updating transporter: ' + error.message);
    }
  }
}
