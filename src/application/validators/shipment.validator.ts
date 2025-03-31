import { checkSchema } from 'express-validator';

export const createShipmentValidator = checkSchema({
  origin_address: {
    in: ['body'],
    isString: {
      errorMessage: 'Origin address must be a string',
    },
    notEmpty: {
      errorMessage: 'Origin address is required',
    },
    trim: true,
  },
  destination_address: {
    in: ['body'],
    isString: {
      errorMessage: 'Destination address must be a string',
    },
    notEmpty: {
      errorMessage: 'Destination address is required',
    },
    trim: true,
  },
  'package.weight': {
    in: ['body'],
    isFloat: {
      options: { min: 0.01 },
      errorMessage: 'Package weight must be a positive number',
    },
    notEmpty: {
      errorMessage: 'Package weight is required',
    },
  },
  'package.size': {
    in: ['body'],
    isString: {
      errorMessage: 'Package size must be a string',
    },
    notEmpty: {
      errorMessage: 'Package size is required',
    },
    trim: true,
  },
  'package.type_of_product': {
    in: ['body'],
    isString: {
      errorMessage: 'Product type must be a string',
    },
    notEmpty: {
      errorMessage: 'Product type is required',
    },
    trim: true,
  },
  'package.description': {
    in: ['body'],
    isString: {
      errorMessage: 'Package description must be a string',
    },
    optional: { 
      options: { 
        checkFalsy: false,
        nullable: true
      }
    },
    trim: true,
  },
  'package.value': {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Package value must be a non-negative number',
    },
    notEmpty: {
      errorMessage: 'Package value is required',
    },
  },
});
