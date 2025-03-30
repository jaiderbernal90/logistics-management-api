import Redis from 'ioredis';
import envs from '@/infrastructure/config/envs';
import { createLogger } from '@/infrastructure/logger';

const logger = createLogger('redis-service');

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: envs.redis.host,
      port: envs.redis.port,
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });
  }

  async set(key: string, value: any, expiryInSeconds = 3600): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', expiryInSeconds);
    } catch (error) {
      logger.error(`Error setting value in Redis: ${key}`, error);
    }
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting value from Redis: ${key}`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Error deleting key from Redis: ${key}`, error);
    }
  }
}

export const redisService = new RedisService();
