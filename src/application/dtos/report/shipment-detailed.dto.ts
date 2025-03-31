import { ShipmentState } from '@/domain/entities/shipment.entity';

export class ShipmentAdvancedFilterDto {
  startDate?: string;
  endDate?: string;
  state?: ShipmentState;
  transporterId?: number;
  routeId?: number;
  page?: number = 1;
  limit?: number = 20;
}

export class ShipmentPackageInfoDto {
  weight?: number;
  size?: string;
  typeOfProduct?: string;
  value?: number;
}

export class ShipmentDetailedDto {
  id: number;
  trackingNumber: string;
  state: ShipmentState;
  date: Date;
  deliveryDate?: Date;
  originAddress: string;
  destinationAddress: string;
  transporterId?: number;
  transporterName?: string;
  routeId?: number;
  routeName?: string;
  userId: number;
  userName: string;
  packageInfo?: ShipmentPackageInfoDto;
  deliveryTime?: number;
}

export class ShipmentDetailedResponseDto {
  items: ShipmentDetailedDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
