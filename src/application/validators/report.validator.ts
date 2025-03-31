import { checkSchema } from 'express-validator';
import { ShipmentState } from '@/domain/entities/shipment.entity';

export const shipmentReportValidator = checkSchema({
  startDate: {
    in: ['query'],
    optional: true,
    isISO8601: {
      errorMessage: 'Start date must be a valid ISO date format (YYYY-MM-DD)',
    },
  },
  endDate: {
    in: ['query'],
    optional: true,
    isISO8601: {
      errorMessage: 'End date must be a valid ISO date format (YYYY-MM-DD)',
    },
    custom: {
      options: (value, { req }) => {
        if (req.query.startDate && value) {
          const startDate = new Date(req.query.startDate as string);
          const endDate = new Date(value);
          if (endDate < startDate) {
            throw new Error(
              'End date must be greater than or equal to start date',
            );
          }
        }
        return true;
      },
    },
  },
  state: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [Object.values(ShipmentState)],
      errorMessage: `State must be one of: ${Object.values(ShipmentState).join(
        ', ',
      )}`,
    },
  },
  transporterId: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Transporter ID must be a positive integer',
    },
    toInt: true,
  },
  page: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Page must be a positive integer',
    },
    toInt: true,
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1, max: 100 },
      errorMessage: 'Limit must be a positive integer not exceeding 100',
    },
    toInt: true,
  },
});
