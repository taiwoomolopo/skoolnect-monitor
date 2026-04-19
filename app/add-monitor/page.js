"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddMonitor() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const router = useRouter(); // ✅ goes here (inside component)

  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase.from("monitors").insert([
      {
        url,
        name,
        interval: 5,
      },
    ]);

    // ✅ redirect AFTER insert
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button type="submit">Add Monitor</button>
    </form>
  );
}