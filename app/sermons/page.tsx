"use client";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { supabasePublic } from "@/lib/supabase/public";
import SermonsGrid from "@/components/SermonsGrid";

type Sermon = {
  id: string;
  title: string;
  pastor_name: string;
  sermon_date: string;
  youtube_url?: string;
  description?: string;
};

export default function Sermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabasePublic
      .from("sermons")
      .select("*")
      .eq("is_published", true)
      .order("sermon_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[sermons page] Supabase fetch failed:", error.message);
          setLoadError(error.message);
        } else {
          setSermons(data || []);
        }
        setLoaded(true);
      });
  }, []);

  return (
    <div className="text-parchment min-h-screen">
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2">
            <BookOpen size={13} strokeWidth={2.4} /> Sermons
          </p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">
            Messages to <span className="grad-text">feed your faith.</span>
          </h1>
          <p className="mt-4 text-parchment/50 text-sm">Tap any sermon to watch it right here — no redirect to YouTube.</p>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-7xl px-6 py-20">
        {loadError && (
          <p className="text-center py-16 text-parchment/50">
            Failed to load sermons. Please try again later.
          </p>
        )}
        {!loadError && loaded && sermons.length === 0 && (
          <p className="text-center py-16 text-parchment/50">
            No sermons found. Please check back later for new messages.
          </p>
        )}
        {!loadError && sermons.length > 0 && <SermonsGrid sermons={sermons} />}
      </section>
    </div>
  );
}
