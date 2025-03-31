import { TransporterDto } from '@/application/dtos/transporter/transporter.dto';

export interface TransporterRepository {
  findById(id: number): Promise<TransporterDto | null>;
  findAvailable(): Promise<TransporterDto[]>;
  updateAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<TransporterDto | null>;
  findAll(): Promise<TransporterDto[]>;
}
