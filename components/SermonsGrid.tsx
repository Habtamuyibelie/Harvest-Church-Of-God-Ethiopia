"use client";
import { useState } from "react";
import { Play, X } from "lucide-react";

type Sermon = {
  id: string;
  title: string;
  pastor_name: string;
  sermon_date: string;
  youtube_url?: string;
  description?: string;
};

function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export default function SermonsGrid({ sermons }: { sermons: Sermon[] }) {
  const [playing, setPlaying] = useState<Sermon | null>(null);
  const playingId = playing ? youtubeId(playing.youtube_url) : null;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((s) => {
          const vid = youtubeId(s.youtube_url);
          const thumb = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => vid && setPlaying(s)}
              disabled={!vid}
              className="group text-left block disabled:cursor-default"
            >
              <div className="aspect-video bg-gradient-to-br from-surfaceUp to-blueDark mb-4 relative overflow-hidden rounded-xl border border-hairline/[0.07]">
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={s.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-red/10 to-blue/20" />
                {vid && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-14 w-14 rounded-full border-2 border-hairline/30 flex items-center justify-center bg-hairline/10 backdrop-blur group-hover:scale-110 transition-transform">
                      <Play size={18} strokeWidth={2} className="text-parchment fill-parchment" />
                    </span>
                  </div>
                )}
              </div>
              <h2 className="font-display text-lg text-parchment group-hover:text-gold transition-colors">{s.title}</h2>
              <p className="text-sm text-parchment/50">
                {s.pastor_name} · {new Date(s.sermon_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </button>
          );
        })}
      </div>

      {playing && playingId && (
        <div
          className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPlaying(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
              <iframe
                key={playingId}
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1`}
                title={playing.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="text-parchment/70 text-center mt-3 text-sm">{playing.title} — {playing.pastor_name}</p>
            <button
              onClick={() => setPlaying(null)}
              aria-label="Close"
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            >
              <X size={26} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
