import "dotenv/config";
import { monitorQueue } from "./queue.js";
import { supabase } from "./supabase.js";

async function runScheduler() {
  console.log("🕒 Scheduler started...");

  while (true) {
    console.log("🔄 Running scheduler cycle...");

    try {
      const { data: monitors, error } = await supabase
        .from("monitors")
        .select("*");

      if (error) {
        console.error("❌ Error fetching monitors:", error);
        continue;
      }

      if (!monitors || monitors.length === 0) {
        console.log("No monitors found");
      }

      const now = Date.now();

      for (const monitor of monitors) {
        try {
          const lastChecked = monitor.last_checked
            ? new Date(monitor.last_checked).getTime()
            : 0;

          const intervalMs = (monitor.interval || 300) * 1000;

          if (now - lastChecked >= intervalMs) {
            console.log("📌 Queueing:", monitor.url);

            await monitorQueue.add(
              "check",
              { monitor },
              {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 2,
                backoff: {
                  type: "exponential",
                  delay: 2000,
                },
              }
            );

            // NOTE: still acceptable for now
            await supabase
              .from("monitors")
              .update({
                last_checked: new Date().toISOString(),
              })
              .eq("id", monitor.id);
          }
        } catch (err) {
          console.error("❌ Scheduler error for:", monitor.url, err);
        }
      }

    } catch (err) {
      console.error("❌ Scheduler cycle failed:", err);
    }

    // wait 60 seconds before next cycle
    await new Promise((res) => setTimeout(res, 60000));
  }
}

runScheduler();