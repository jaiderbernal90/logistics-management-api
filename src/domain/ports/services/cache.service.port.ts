export interface CacheService {
  set(key: string, value: any, expiryInSeconds?: number): Promise<void>;
  get(key: string): Promise<any>;
  del(key: string): Promise<void>;
}
