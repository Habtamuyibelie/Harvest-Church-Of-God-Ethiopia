"use client";
import { useEffect, useState } from "react";
import { supabasePublic } from "@/lib/supabase/public";

type Evt = { id: string; title: string; event_date: string; event_time?: string };

export default function HomeUpcomingEvents() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabasePublic
      .from("events")
      .select("id, title, event_date, event_time")
      .eq("is_published", true)
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .limit(3)
      .then(({ data, error }) => {
        if (error) console.error("[home page] events fetch failed:", error.message);
        setEvents(data || []);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((e) => {
        const d = new Date(e.event_date + "T00:00:00");
        return (
          <div key={e.id} className="glass rounded-2xl p-6 flex gap-5 items-start hover:border-gold/20 transition-colors group">
            <div className="text-center shrink-0 bg-gradient-to-b from-gold/20 to-gold/5 rounded-xl px-4 py-3 border border-gold/20">
              <p className="font-display text-3xl text-gold leading-none">{d.getDate()}</p>
              <p className="text-xs tracking-widest text-parchment/50 mt-1">{d.toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</p>
            </div>
            <div>
              <h3 className="font-display text-lg text-parchment mb-1 group-hover:text-gold transition-colors">{e.title}</h3>
              {e.event_time && <p className="text-sm text-parchment/55">{e.event_time}</p>}
            </div>
          </div>
        );
      })}
      {loaded && events.length === 0 && (
        <p className="text-parchment/45 col-span-full">No upcoming events yet — check back soon.</p>
      )}
    </div>
  );
}
