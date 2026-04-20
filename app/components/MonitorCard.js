import { supabase } from "@/lib/supabase";

export default async function MonitorCard({ monitor }) {
  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .eq("monitor_id", monitor.id)
    .order("checked_at", { ascending: false })
    .limit(20);

  const latest = logs?.[0];

  return (
    <div style={{
      border: "1px solid #eee",
      padding: 20,
      borderRadius: 10,
      marginBottom: 15
    }}>
      <h3>{monitor.name}</h3>
      <p>{monitor.url}</p>

      <p>
        Status: {latest?.status === "up" ? "🟢 UP" : "🔴 DOWN"}
      </p>

      <p>Uptime: {monitor.uptime_percentage?.toFixed(2)}%</p>

      <div style={{ display: "flex", gap: 4 }}>
        {logs?.map((log, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              background:
                log.status === "up" ? "green" : "red",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}