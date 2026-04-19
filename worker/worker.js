import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { checkWithRetry } from "./monitor.js";
import { supabase } from "./supabase.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

const worker = new Worker(
  "monitor-queue",
  async (job) => {
    const { monitor } = job.data;

    console.log("Checking:", monitor.url);

    const result = await checkWithRetry(monitor.url);

    await supabase.from("logs").insert({
      monitor_id: monitor.id,
      status: result.status,
      response_time: result.response_time,
      error: result.error || null,
    });

    console.log("Saved result:", result);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});