export interface AssignShipmentDto {
  shipment_id: number;
  route_id: number;
  transporter_id: number;
}

export interface ShipmentAssignmentResponseDto {
  message: string;
  shipment: {
    id: number;
    tracking_number: string;
    state: string;
    transporter: {
      id: number;
      name: string;
      plate: string;
    };
    route: {
      id: number;
      name: string;
    };
  };
}
