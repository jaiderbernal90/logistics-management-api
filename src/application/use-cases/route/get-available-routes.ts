import { RouteRepository } from '@/domain/ports/repositories/route.repository.port';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('get-available-routes-use-case');

export class GetAvailableRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute() {
    try {
      return await this.routeRepository.findAll();
    } catch (error) {
      logger.error('Error getting available routes', error);
      throw error;
    }
  }
}
