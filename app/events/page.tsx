"use client";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { supabasePublic } from "@/lib/supabase/public";

type Evt = {
  id: string;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
};

const accents = ["gold", "green", "red", "blue"] as const;
const accentCls: Record<string, string> = {
  gold: "border-gold text-gold",
  green: "border-green text-green",
  red: "border-red text-red",
  blue: "border-blue text-blue",
};

export default function Events() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    supabasePublic
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("event_date", todayISO)
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("[events page] Supabase fetch failed:", error.message);
          setLoadError(error.message);
        } else {
          setEvents(data || []);
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
            <CalendarDays size={13} strokeWidth={2.4} /> Events
          </p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">
            Gather with us <span className="grad-text">this season.</span>
          </h1>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-4xl px-6 py-20 space-y-5">
        {loadError && (
         
          <p className="text-center py-16 text-parchment/50">Failed to load events: {loadError}</p>
        )}
        {!loadError && loaded && events.length === 0 && (
          <p className="text-center py-16 text-parchment/50">No upcoming events found.</p>
        )}
        {events.map((e, idx) => {
          const d = new Date(e.event_date + "T00:00:00");
          const accent = accents[idx % accents.length];
          return (
            <div key={e.id} className="glass rounded-2xl p-6 flex gap-6 items-start hover:border-gold/20 transition-colors group">
              <div className={`text-center shrink-0 w-16 border-2 ${accentCls[accent]} rounded-xl py-3`}>
                <p className="font-display text-3xl leading-none">{d.getDate()}</p>
                <p className="text-[0.65rem] tracking-widest text-parchment/40 mt-1">
        
                  {d.toLocaleDateString("en-US", { month: "short" ,year: "numeric"}).toUpperCase()}
                </p>
              </div>
              <div>
                <h2 className="font-display text-xl text-parchment mb-1 group-hover:text-gold transition-colors">{e.title}</h2>
                {e.event_time && <p className="text-[0.78rem] text-gold font-semibold mb-2">{e.event_time}{e.location ? ` — ${e.location}` : ""}</p>}
                {e.description && <p className="text-[0.88rem] text-parchment/60 leading-relaxed">{e.description}</p>}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
