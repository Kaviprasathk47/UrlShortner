import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

let client = null;
let isAvailable = false;

try {
  client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      reconnectStrategy: () => false,
    },
  });

  await client.connect();
  isAvailable = true;
  console.log("✅ Redis connected successfully");
} catch (err) {
  console.warn("⚠️ Redis unavailable — running without cache:", err.message);
  if (client) {
    try {
      await client.quit();
    } catch {
      // ignore cleanup errors
    }
    client = null;
  }
}

const redisClient = {
  async get(key) {
    if (!isAvailable || !client?.isReady) return null;
    try {
      return await client.get(key);
    } catch {
      return null;
    }
  },
  async setEx(key, ttl, value) {
    if (!isAvailable || !client?.isReady) return;
    try {
      await client.setEx(key, ttl, value);
    } catch {
      // cache write failures should not break requests
    }
  },
};

export default redisClient;
