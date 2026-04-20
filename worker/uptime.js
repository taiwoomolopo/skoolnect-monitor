import { supabase } from "./supabase.js";

export async function calculateUptime(monitorId) {
  const { data: logs } = await supabase
    .from("logs")
    .select("status")
    .eq("monitor_id", monitorId);

  if (!logs || logs.length === 0) return 100;

  const total = logs.length;
  const upCount = logs.filter((l) => l.status === "up").length;

  return (upCount / total) * 100;
}