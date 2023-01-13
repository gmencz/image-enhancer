import Redis from "ioredis";
import invariant from "tiny-invariant";

const { REDIS_URL } = process.env;
invariant(typeof REDIS_URL === "string", "REDIS_URL env var not set");

const redis = new Redis(REDIS_URL);

export { redis };
