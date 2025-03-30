import { TransporterRepository } from '@/domain/ports/repositories/transporter.repository.port';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('get-available-transporters-use-case');

export class GetAvailableTransportersUseCase {
  constructor(private readonly transporterRepository: TransporterRepository) {}

  async execute() {
    try {
      return await this.transporterRepository.findAvailable();
    } catch (error) {
      logger.error('Error getting available transporters', error);
      throw error;
    }
  }
}
