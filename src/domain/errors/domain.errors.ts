export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with identifier ${id} not found`
      : `${resource} not found`;
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class InsufficientCapacityError extends DomainError {
  constructor(resource: string, required: number, available: number) {
    super(
      `${resource} does not have enough capacity. Required: ${required}, Available: ${available}`,
    );
  }
}

export class TransporterUnavailableError extends DomainError {
  constructor(transporterId: number) {
    super(`Transporter with ID ${transporterId} is not available`);
  }
}

export class InvalidShipmentStateError extends DomainError {
  constructor(currentState: string, expectedState: string) {
    super(
      `Shipment is in "${currentState}" state. Expected: "${expectedState}"`,
    );
  }
}
