export class Package {
  id: number;
  weight: number;
  size: string;
  type_of_product: string;
  description: string;
  value: number;
  user_id: number;
  shipment_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Shippments orders
// state ->  En espera → En tránsito → Entregado.
// user_id
// transporter_id
// vehicle_id
// date
// delivery_date
// route_id
// tracking_number -> 8 digitos
// origin_address
// destination_address
// orders_status
// id
// status
// location
// shippingOrderId
// Packages
// weight
// size
// type_of_product
// description
// value
// user_id
// state
// shipment_id
// Routes
// name
// origin
// destination
// Users
// name
// email
// password
// role -> CUSTOMER, ADMIN, DRIVER
// Vehicles
// capacity
// type
// plate
// Transporters
// name
// vehicle_id
// is_available
// user_id

// Un usuario puede tener uno o varios paquetes
// Una orden de envío puede tener solo un paquete
// Una orden de envio puede tener solo una ruta y un transportista
// Un transportista puede tener solo un vehiculo
// Un transportista puede tener una o varias rutas
// Un vehiculo puede tener una o varias ordenes de envio
