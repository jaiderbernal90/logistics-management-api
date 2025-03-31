import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/infrastructure/utils/errors.response';
import { createLogger } from '@/infrastructure/logger';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  InsufficientCapacityError,
  TransporterUnavailableError,
  InvalidShipmentStateError,
} from '@/domain/errors/domain.errors';

const logger = createLogger('error-handler-middleware');

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack, name: err.name });

  if (err instanceof NotFoundError) {
    return res.status(404).json(ApiResponse.error(err.message));
  }

  if (err instanceof ValidationError) {
    return res.status(400).json(ApiResponse.error(err.message));
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json(ApiResponse.error(err.message));
  }

  if (err instanceof ConflictError) {
    return res.status(409).json(ApiResponse.error(err.message));
  }

  if (
    err instanceof InsufficientCapacityError ||
    err instanceof TransporterUnavailableError ||
    err instanceof InvalidShipmentStateError
  ) {
    return res.status(422).json(ApiResponse.error(err.message));
  }

  if (err instanceof DomainError) {
    return res.status(400).json(ApiResponse.error(err.message));
  }

  return res
    .status(500)
    .json(
      ApiResponse.error(
        'An unexpected error occurred. Please try again later.',
      ),
    );
};
