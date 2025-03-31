export class TransporterPerformanceFilterDto {
  startDate?: string;
  endDate?: string;
}

export class TransporterPerformanceItemDto {
  transporterId: number;
  transporterName: string;
  totalShipments: number;
  completedShipments: number;
  avgDeliveryTimeHours: number;
  onTimePercentage: number;
}

export class TransporterPerformanceResponseDto {
  transporters: TransporterPerformanceItemDto[];
  overallAvgDeliveryTime: number;
  totalShipments: number;
}
