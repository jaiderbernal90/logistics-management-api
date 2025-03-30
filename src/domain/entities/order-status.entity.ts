export class OrderStatus {
  id: number;
  shipment_id: number;
  status: string;
  location?: string;
  created_at?: Date;
}
