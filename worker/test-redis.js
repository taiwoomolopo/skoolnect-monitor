import IORedis from "ioredis";
import "dotenv/config";

const redis = new IORedis(process.env.REDIS_URL, {
  tls: {},
});

redis.set("test", "hello");
redis.get("test").then(console.log);