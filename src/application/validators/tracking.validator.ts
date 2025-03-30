import { checkSchema } from 'express-validator';

export const trackingNumberValidator = checkSchema({
  trackingNumber: {
    in: ['params'],
    isString: {
      errorMessage: 'Tracking number must be a string',
    },
    notEmpty: {
      errorMessage: 'Tracking number is required',
    },
    isLength: {
      options: { min: 8, max: 8 },
      errorMessage: 'Tracking number must be 8 characters long',
    },
  },
});
