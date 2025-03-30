import { checkSchema } from 'express-validator';
import { ShipmentState } from '@/domain/entities/shipment.entity';

export const updateShipmentStatusValidator = checkSchema({
  shipmentId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Shipment ID must be a positive integer',
    },
    notEmpty: {
      errorMessage: 'Shipment ID is required',
    },
  },
  newState: {
    in: ['body'],
    isIn: {
      options: [Object.values(ShipmentState)],
      errorMessage: `State must be one of: ${Object.values(ShipmentState).join(
        ', ',
      )}`,
    },
    notEmpty: {
      errorMessage: 'New state is required',
    },
  },
  location: {
    in: ['body'],
    isString: {
      errorMessage: 'Location must be a string',
    },
    notEmpty: {
      errorMessage: 'Location is required',
    },
    trim: true,
  },
});
