import { customAlphabet } from 'nanoid';

const generateTrackingNumber = customAlphabet('0123456789', 8);

/**
 * Genera un número de seguimiento aleatorio de 8 dígitos
 * @returns Número de seguimiento
 */
export function getTrackingNumber(): string {
  return generateTrackingNumber();
}
