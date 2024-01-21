const Redis = require('ioredis');
require('dotenv').config();

const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    console.log(`Redis Connected`);
    return new Redis(process.env.REDIS_URL);
  }
  throw new Error('Redis connection failed...');
};

const redisClient = createRedisClient();

module.exports = redisClient;
