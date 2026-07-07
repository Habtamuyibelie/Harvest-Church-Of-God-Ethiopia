"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Images } from "lucide-react";
import { supabasePublic } from "@/lib/supabase/public";

type GalleryImage = { id:string; album:string; caption?:string; storage_path:string; url:string; created_at:string; };

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryImage|null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    supabasePublic.from("gallery_images").select("*").order("created_at",{ascending:false})
      .then(({data, error}) => {
        if (error) { console.error("[gallery page] Supabase fetch failed:", error.message); setLoadError(error.message); return; }
        if (!data) return;
        const imgs = data.map(img => ({
          ...img,
          url: supabasePublic.storage.from("gallery-images").getPublicUrl(img.storage_path).data.publicUrl,
        }));
        setImages(imgs);
      });
  }, []);

  const albums = ["All", ...Array.from(new Set(images.map(i => i.album)))];
  const filtered = activeAlbum === "All" ? images : images.filter(i => i.album === activeAlbum);

  return (
    <div className="min-h-screen" style={{color:"var(--text)"}}>
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2"><Images size={13}/> Gallery</p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">Moments from <span className="grad-text">our church family.</span></h1>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-7xl px-6 py-20">
        {albums.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {albums.map(a => (
              <button key={a} onClick={()=>setActiveAlbum(a)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all
                  ${activeAlbum===a ? "bg-gold text-ink border-gold" : "border-[var(--border)] hover:border-gold"}`}
                style={activeAlbum!==a?{color:"var(--text-muted)"}:{}}>
                {a}
              </button>
            ))}
          </div>
        )}
        {loadError ? (
          <p className="text-center py-16 text-red text-sm">
            Couldn't load the gallery ({loadError}). Check that <code>supabase/schema.sql</code> has been run and RLS is set up correctly.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No images yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(img => (
              <div key={img.id} className="group cursor-pointer aspect-square relative overflow-hidden rounded-xl"
                onClick={()=>setLightbox(img)}>
                <Image src={img.url} alt={img.caption||img.album} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-3">
                  {img.caption && <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-semibold">{img.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={()=>setLightbox(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e=>e.stopPropagation()}>
            <Image src={lightbox.url} alt={lightbox.caption||lightbox.album} width={1200} height={800}
              className="object-contain max-h-[80vh] w-full rounded-xl" />
            {lightbox.caption && <p className="text-white/70 text-center mt-3 text-sm">{lightbox.caption}</p>}
            <button onClick={()=>setLightbox(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white text-2xl">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
