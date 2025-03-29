import { UserRole } from '@/domain/entities/user.entity';
import { body, checkSchema } from 'express-validator';

export const registerUserValidator = checkSchema({
  name: {
    in: ['body'],
    isString: {
      errorMessage: 'Name must be a string',
    },
    notEmpty: {
      errorMessage: 'Name is required',
    },
    trim: true,
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Name must be between 2 and 100 characters',
    },
  },
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Must be a valid email address',
    },
    normalizeEmail: true,
    notEmpty: {
      errorMessage: 'Email is required',
    },
  },
  password: {
    in: ['body'],
    isString: {
      errorMessage: 'Password must be a string',
    },
    notEmpty: {
      errorMessage: 'Password is required',
    },
    isLength: {
      options: { min: 8, max: 100 },
      errorMessage: 'Password must be between 8 and 100 characters',
    },
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      },
      errorMessage:
        'Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol',
    },
  },
  role: {
    in: ['body'],
    optional: true,
    isIn: {
      options: [Object.values(UserRole)],
      errorMessage: `Role must be one of: ${Object.values(UserRole).join(
        ', ',
      )}`,
    },
  },
});

export const loginUserValidator = checkSchema({
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Must be a valid email address',
    },
    normalizeEmail: true,
    notEmpty: {
      errorMessage: 'Email is required',
    },
  },
  password: {
    in: ['body'],
    isString: {
      errorMessage: 'Password must be a string',
    },
    notEmpty: {
      errorMessage: 'Password is required',
    },
  },
});
