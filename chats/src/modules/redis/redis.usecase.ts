import { redis } from '../../infra/database/redis/index.js';

export class RedisUsecase {
  constructor() {}

  protected async getValueKey(key: string) {
    try {
      return await redis.get(key);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  protected async setKey(key: string, value: string, duration: number) {
    try {
      await redis.set(key, value, {
        EX: duration,
      });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  protected async getKeys(key: string) {
    try {
      return await redis.keys(key);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  protected async deleteKeys(key: string) {
    try {
      const keys = await this.getKeys(key);
      await redis.del(keys.length === 0 ? '' : keys);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  protected async updatedDurationKey(key: string, duration: number, typeExpire: 'GT' | 'NX' | 'XX' | 'LT' = 'GT') {
    try {
      if (!/(GT|NX|XX|LT)/.test(typeExpire)) {
        throw new Error('typeExpire key Redis no exist', {
          cause: 'ERR:REDIS:0001',
        });
      }
      await redis.expire(key, duration, typeExpire);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  protected handleError(error: unknown) {
    console.debug('\x1b[31m[<<<---START ERROR--->>>]\x1b[0m');
    console.error(error);
    console.debug('\x1b[31m[<<<---END ERROR--->>>]\x1b[0m');
  }
}
