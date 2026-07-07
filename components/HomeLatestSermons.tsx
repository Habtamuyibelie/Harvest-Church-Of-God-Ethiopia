"use client";
import { useEffect, useState } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import SermonsGrid from "@/components/SermonsGrid";

type Sermon = { id: string; title: string; pastor_name: string; sermon_date: string; youtube_url?: string };

export default function HomeLatestSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabasePublic
      .from("sermons")
      .select("id, title, pastor_name, sermon_date, youtube_url")
      .eq("is_published", true)
      .order("sermon_date", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) console.error("[home page] sermons fetch failed:", error.message);
        setSermons(data || []);
        setLoaded(true);
      });
  }, []);

  if (sermons.length === 0) {
    return loaded ? <p className="text-parchment/45">No sermons posted yet — check back soon.</p> : null;
  }
  return <SermonsGrid sermons={sermons} />;
}
