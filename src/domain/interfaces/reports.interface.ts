import { ShipmentState } from "../entities/shipment.entity";

export interface TransporterPerformanceFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface TransporterPerformanceItem {
  transporterId: number;
  transporterName: string;
  totalShipments: number;
  completedShipments: number;
  avgDeliveryTimeHours: number;
  onTimePercentage: number;
}

export interface TransporterPerformanceSummary {
  transporters: TransporterPerformanceItem[];
  overallAvgDeliveryTime: number;
  totalShipments: number;
}

export interface ShipmentAdvancedFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  state?: ShipmentState;
  transporterId?: number;
  routeId?: number;
  limit?: number;
  page?: number;
}

export interface ShipmentDetailedView {
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
  packageInfo?: {
    weight?: number;
    size?: string;
    typeOfProduct?: string;
    value?: number;
  };
  deliveryTime?: number;
}
