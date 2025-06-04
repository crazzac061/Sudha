import { Store } from 'express-rate-limit';
import { Redis } from 'ioredis';

declare module 'rate-limit-redis' {
  interface RedisStoreOptions {
    redisClient: Redis;
    prefix?: string;
    resetExpiryOnChange?: boolean;
  }

  interface RedisStore extends Store {
    resetKey: (key: string) => Promise<void>;
    resetAll: () => Promise<void>;
  }

  class RedisStoreClass implements RedisStore {
    constructor(options: RedisStoreOptions);
    incr(key: string): Promise<{ totalHits: number; resetTime: Date }>;
    decrement(key: string): Promise<void>;
    resetKey(key: string): Promise<void>;
    resetAll(): Promise<void>;
  }

  export default RedisStoreClass;
}
