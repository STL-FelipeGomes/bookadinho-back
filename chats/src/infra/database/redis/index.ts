import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || '',
});
redis.on('error', function (err) {
  throw err;
});
await redis.connect();
export { redis };
