import { checkSchema } from 'express-validator';

export const assignShipmentValidator = checkSchema({
  shipment_id: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Shipment ID must be a positive integer',
    },
    notEmpty: {
      errorMessage: 'Shipment ID is required',
    },
  },
  route_id: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Route ID must be a positive integer',
    },
    notEmpty: {
      errorMessage: 'Route ID is required',
    },
  },
  transporter_id: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Transporter ID must be a positive integer',
    },
    notEmpty: {
      errorMessage: 'Transporter ID is required',
    },
  },
});
