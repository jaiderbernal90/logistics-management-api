export enum ShipmentState {
  EN_ESPERA = 'En espera',
  EN_TRANSITO = 'En tránsito',
  ENTREGADO = 'Entregado',
}

export class Shipment {
  id: number;
  user_id: number;
  transporter_id?: number;
  route_id?: number;
  tracking_number: string;
  state: ShipmentState;
  date: Date;
  delivery_date?: Date;
  origin_address: string;
  destination_address: string;
  created_at?: Date;
  updated_at?: Date;
}
