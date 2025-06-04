import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  keyPrefix: string;
}

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  enableReadyCheck: true,
  maxReconnectAttempts: 10,
};

// Initialize Redis client
const redis = new Redis(redisConfig);

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

// Create rate limiter with fallback to memory store if Redis fails
const createRateLimiter = (config: RateLimitConfig) => {
  // Create Redis store with our compatible options
  const store = new RedisStore({
    redisClient: redis,
    prefix: config.keyPrefix,
    resetExpiryOnChange: true
  });

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    skip: (_req) => false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: config.message
      });
    },
    store
  });
};

// Define different rate limiters
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyPrefix: 'rl:api:',
});

export const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts from this IP, please try again after an hour',
  keyPrefix: 'rl:login:',
});

export const createAccountLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 account creations per day
  message: 'Too many accounts created from this IP, please try again after 24 hours',
  keyPrefix: 'rl:create:',
});
