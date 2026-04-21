import { Redis } from "ioredis";
import { env } from "../config/env.js";

const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3 });

redis.on("error", (err) => console.error("Redis error:", err));

export class CacheService {
  async ping() {
    redis.ping();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      console.error(err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      console.error(err);
    }
  }
}

export const cache = new CacheService();
