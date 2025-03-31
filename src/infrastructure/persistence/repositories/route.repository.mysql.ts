import { RouteDto } from '@/application/dtos/route/route.dto';
import { RouteRepository } from '@/domain/ports/repositories/route.repository.port';
import { db } from '@/infrastructure/database/database.config';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('route-repository');

export class MysqlRouteRepository implements RouteRepository {
  async findById(id: number): Promise<RouteDto | null> {
    try {
      const query = `SELECT * FROM routes WHERE id = ?`;
      const results = await db.query(query, [id]);

      if (!results || results.length === 0) {
        return null;
      }

      return results[0] as RouteDto;
    } catch (error) {
      logger.error(`Error finding route by ID: ${id}`, error);
      throw new Error('Error finding route: ' + error.message);
    }
  }

  async findAll(): Promise<RouteDto[]> {
    try {
      const query = `SELECT * FROM routes ORDER BY name`;
      const results = await db.query(query);

      if (!results || results.length === 0) {
        return [];
      }

      return results as RouteDto[];
    } catch (error) {
      logger.error('Error finding all routes', error);
      throw new Error('Error finding routes: ' + error.message);
    }
  }
}
