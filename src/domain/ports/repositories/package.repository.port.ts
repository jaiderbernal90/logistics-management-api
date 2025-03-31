import { Package } from '@/domain/entities/package.entity';
import { CreatePackageDto } from '@/application/dtos/package/package.dto';

export interface PackageRepository {
  create(
    packageData: CreatePackageDto,
    userId: number,
    shipmentId?: number,
  ): Promise<Package>;
  findById(id: number): Promise<Package | null>;
  findByShipmentId(shipmentId: number): Promise<Package | null>;
  findByUserId(userId: number): Promise<Package[]>;
  update(id: number, packageData: Partial<Package>): Promise<Package | null>;
}
