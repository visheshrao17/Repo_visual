import { Redis } from "ioredis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let redisConnection: Redis | null = null;

export const getRedisConnection = () => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisConnection) {
    redisConnection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null
    });

    redisConnection.on("error", (error) => {
      logger.error({ err: error }, "Redis connection error");
    });
  }

  return redisConnection;
};
