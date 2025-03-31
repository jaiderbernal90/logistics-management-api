import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors: Record<string, string> = {};
  errors.array().forEach(err => {
    if (err.type === 'field') {
      extractedErrors[err.path] = err.msg;
    }
  });
  
  return res.status(400).json(
    ApiResponse.error('Validation failed', extractedErrors)
  );
};