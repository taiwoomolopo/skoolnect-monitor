const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkMonitors() {
  const { data: monitors } = await supabase.from("monitors").select("*");

  for (const monitor of monitors) {
    const start = Date.now();

    try {
      const res = await axios.get(monitor.url);

      await supabase.from("logs").insert({
        monitor_id: monitor.id,
        status: "up",
        response_time: Date.now() - start,
      });

    } catch (err) {
      await supabase.from("logs").insert({
        monitor_id: monitor.id,
        status: "down",
        response_time: Date.now() - start,
      });
    }
  }
}

checkMonitors();