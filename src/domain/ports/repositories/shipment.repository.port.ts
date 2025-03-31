import { Shipment, ShipmentState } from '@/domain/entities/shipment.entity';
import { Page, PageRequest } from '@/domain/interfaces/pagination.interface';
import { ShipmentAdvancedFilter, ShipmentDetailedView, TransporterPerformanceFilter, TransporterPerformanceSummary } from '@/domain/interfaces/reports.interface';

export interface ShipmentRepository {
  create(shipment: Partial<Shipment>): Promise<Shipment>;
  findById(id: number): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: string): Promise<Shipment | null>;
  findByUserId(userId: number): Promise<Shipment[]>;
  update(id: number, shipmentData: Partial<Shipment>): Promise<Shipment | null>;
  findByState(state: ShipmentState): Promise<Shipment[]>;
  findByTransporterAndState(
    transporterId: number,
    state: ShipmentState,
  ): Promise<Shipment[]>;
  findShipmentsAdvanced(
    filter: ShipmentAdvancedFilter, 
    pageRequest: PageRequest
  ): Promise<Page<ShipmentDetailedView>>;
  getTransportersPerformance(
    filter: TransporterPerformanceFilter,
  ): Promise<TransporterPerformanceSummary>;
  findAll(state?: ShipmentState): Promise<Shipment[]>;
}
