import { supabase } from "@/lib/supabase";

export default async function MonitorCard({ monitor }) {
  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .eq("monitor_id", monitor.id)
    .order("checked_at", { ascending: false })
    .limit(1);

  const latest = logs?.[0];

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 15,
        marginTop: 10,
        borderRadius: 8,
      }}
    >
      <h3>{monitor.name}</h3>
      <p>{monitor.url}</p>

      <p>
        Status:{" "}
        {latest?.status === "up" ? "🟢 UP" : "🔴 DOWN"}
      </p>

      <p>
        Response Time:{" "}
        {latest?.response_time
          ? `${latest.response_time} ms`
          : "N/A"}
      </p>

      <p>
        Last Checked:{" "}
        {latest?.checked_at
          ? new Date(latest.checked_at).toLocaleString()
          : "Never"}
      </p>
    </div>
  );
}