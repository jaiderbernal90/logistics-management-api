import { RouteDto } from '@/application/dtos/route/route.dto';

export interface RouteRepository {
  findById(id: number): Promise<RouteDto | null>;
  findAll(): Promise<RouteDto[]>;
}
