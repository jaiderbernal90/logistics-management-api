import { OrderStatus } from "@/domain/entities/order-status.entity";

export interface OrderStatusRepository {
  create(statusData: Partial<OrderStatus>): Promise<OrderStatus>;
  findByShipmentId(shipmentId: number): Promise<OrderStatus[]>;
}
