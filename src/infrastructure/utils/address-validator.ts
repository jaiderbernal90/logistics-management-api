import envs from '../config/envs';
import { createLogger } from '../logger';
import axios from 'axios';

const logger = createLogger('address-validator');

export async function validateAddress(address: string): Promise<boolean> {
  try {
    if (!address || typeof address !== 'string' || address.trim().length < 10) {
      return false;
    }

    const response = await axios.get(envs.geocoding.provider, {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'Coordinadora-Logistics-App/1.0'
      }
    });

    return !!response?.data?.length;
  } catch (error) {
    logger.error('Error validating address with Nominatim', error);
    const containsNumber = /\d/.test(address);
    const containsStreetOrAvenue = /\b(calle|carrera|avenida|cra|av|cl|transversal|diagonal|autopista)\b/i.test(address);
    
    return containsNumber && containsStreetOrAvenue;
  }
}
