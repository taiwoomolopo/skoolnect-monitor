import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { checkWithRetry } from "./monitor.js";
import { supabase } from "./supabase.js";
import { calculateUptime } from "./uptime.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

const worker = new Worker(
  "monitor-queue",
  async (job) => {
    const { monitor } = job.data;

    try {
      console.log("Checking:", monitor.url);

      const result = await checkWithRetry(monitor.url);

      // SAVE LOG
      await supabase.from("logs").insert({
        monitor_id: monitor.id,
        status: result.status,
        response_time: result.response_time,
        error: result.error || null,
      });

      console.log("Saved result:", result);

      // INCIDENT LOGIC
      if (result.status === "down") {
        const { data: activeIncident } = await supabase
          .from("incidents")
          .select("*")
          .eq("monitor_id", monitor.id)
          .is("resolved_at", null)
          .maybeSingle();

        if (!activeIncident) {
          await supabase.from("incidents").insert({
            monitor_id: monitor.id,
            started_at: new Date().toISOString(),
            status: "down",
          });

          console.log("🚨 Incident started");
        }
      }

      if (result.status === "up") {
        const { data: activeIncident } = await supabase
          .from("incidents")
          .select("*")
          .eq("monitor_id", monitor.id)
          .is("resolved_at", null)
          .maybeSingle();

        if (activeIncident) {
          await supabase
            .from("incidents")
            .update({
              resolved_at: new Date().toISOString(),
              status: "resolved",
            })
            .eq("id", activeIncident.id);

          console.log("✅ Incident resolved");
        }
      }

      // UPTIME CALCULATION
      const uptime = await calculateUptime(monitor.id);

      await supabase
        .from("monitors")
        .update({ uptime_percentage: uptime })
        .eq("id", monitor.id);

      console.log("📈 Uptime:", uptime.toFixed(2) + "%");

    } catch (err) {
      console.error("❌ Worker error:", err);
    }
  },
  {
    connection,
    concurrency: 10, // 🔥 scaling fix
  }
);

// EVENTS (important for debugging)
worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

console.log("🚀 Worker started...");