import { Shipment, ShipmentState } from "@/domain/entities/shipment.entity";

export interface ShipmentRepository {
  create(shipment: Partial<Shipment>): Promise<Shipment>;
  findById(id: number): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: string): Promise<Shipment | null>;
  findByUserId(userId: number): Promise<Shipment[]>;
  update(id: number, shipmentData: Partial<Shipment>): Promise<Shipment | null>;
  findByState(state: ShipmentState): Promise<Shipment[]>;
  findByTransporterAndState(transporterId: number, state: ShipmentState): Promise<Shipment[]>;
}