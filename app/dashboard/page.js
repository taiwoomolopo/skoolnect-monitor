import MonitorCard from "../components/MonitorCard";
import { supabase } from "@/lib/supabase";

export default async function Dashboard() {
  const { data: monitors, error } = await supabase
    .from("monitors")
    .select("*");

  if (error) {
    return <div>Error loading monitors</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Monitoring Dashboard</h1>

      {monitors?.length === 0 && <p>No monitors yet</p>}

      {monitors?.map((monitor) => (
        <MonitorCard key={monitor.id} monitor={monitor} />
      ))}
    </div>
  );
}