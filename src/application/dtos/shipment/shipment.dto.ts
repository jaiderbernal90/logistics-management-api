import { ShipmentState } from '@/domain/entities/shipment.entity';
import { CreatePackageDto, PackageDto } from '../package/package.dto';

export interface CreateShipmentDto {
  origin_address: string;
  destination_address: string;
  package: CreatePackageDto;
}

export interface ShipmentDto {
  id: number;
  tracking_number: string;
  state: ShipmentState;
  date: Date;
  delivery_date?: Date;
  origin_address: string;
  destination_address: string;
  package?: PackageDto;
}

export interface ShipmentCreatedResponseDto {
  message: string;
  shipment: ShipmentDto;
}
