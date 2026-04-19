import "dotenv/config";
import { monitorQueue } from "./queue.js";
import { supabase } from "./supabase.js";

async function runScheduler() {
  console.log("Scheduler started...");

  setInterval(async () => {
    console.log("Running scheduler cycle...");

    const { data: monitors, error } = await supabase
      .from("monitors")
      .select("*");

    if (error) {
      console.error("Error fetching monitors:", error);
      return;
    }

    for (const monitor of monitors) {
      console.log("Queueing:", monitor.url);

      await monitorQueue.add("check", {
        monitor,
      });
    }
  }, 60000); // every 60 seconds
}

runScheduler();