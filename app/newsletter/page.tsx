"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabasePublic } from "@/lib/supabase/public";
import NewsletterReactions from "@/components/NewsletterReactions";
import { useToast } from "@/components/Toast";

const tagColors: Record<string,string> = {
  "Church Life":"bg-blue/20 text-blue border-blue/30",
  "Youth":"bg-green/20 text-green border-green/30",
  "Celebration":"bg-red/20 text-red border-red/30",
};

type Issue = {
  id:string; title:string; amharic?:string; tag:string;
  preview:string; content:string; image_url?:string; author_name?:string; created_at:string;
};

function NewsCard({ issue }: { issue: Issue }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className={`glass rounded-2xl overflow-hidden hover:border-gold/20 transition-colors group ${expanded ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <div className="relative h-48 overflow-hidden">
        <Image src={issue.image_url || "/images/banner.jpg"} alt={issue.title} fill
          className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className={`absolute top-4 left-4 text-[0.65rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${tagColors[issue.tag] || "bg-gold/20 text-gold border-gold/30"}`}>
          {issue.tag}
        </span>
        <span className="absolute bottom-4 left-4 text-[0.72rem] text-white/60">
          {new Date(issue.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl mb-0.5" style={{color:"var(--text)"}}>{issue.title}</h3>
        {issue.amharic && <p className="text-[0.75rem] text-gold italic mb-1">{issue.amharic}</p>}
        {issue.author_name && (
          <p className="text-[0.72rem] mb-3" style={{color:"var(--text-muted)"}}>By {issue.author_name}</p>
        )}
        {expanded ? (
          <div className="prose-newsletter max-w-2xl text-[0.92rem]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-[0.88rem] leading-relaxed" style={{color:"var(--text-muted)"}}>{issue.preview}</p>
        )}
        <button onClick={()=>setExpanded(!expanded)}
          className="mt-4 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-gold hover:text-gold/80 transition-colors">
          {expanded?"Show Less":"Read More"}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
            className={`transition-transform duration-300 ${expanded?"rotate-180":""}`}>
            {expanded
              ?<path d="M8 12L2 6h12l-6 6z" fill="currentColor"/>
              :<path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
        </button>
        <NewsletterReactions issueId={issue.id} />
      </div>
    </article>
  );
}

export default function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [emailError, setEmailError] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    supabasePublic.from("newsletter_issues")
      .select("*").eq("published", true).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error("[newsletter page] Supabase fetch failed:", error.message); setLoadError(error.message); return; }
        setIssues(data || []);
      });
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      toast("Please enter a valid email address.", "error");
      return;
    }
    setEmailError(""); setSubStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) { setSubStatus("err"); toast(json.error || "Something went wrong.", "error"); return; }
      setSubStatus("ok"); setEmail("");
      toast("Subscribed! Check your inbox for a welcome email.", "success");
    } catch { setSubStatus("err"); toast("Network error. Please try again.", "error"); }
  };

  return (
    <div className="min-h-screen" style={{color:"var(--text)"}}>
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2"><Mail size={13}/> Newsletter</p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment mb-5">Stay close to <span className="grad-text">the family.</span></h1>
          <p className="mb-8 text-parchment/60">Monthly updates on sermons, events, and stories from our church community.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value); if(emailError) setEmailError("");}} placeholder="your@email.com"
              aria-invalid={!!emailError}
              className="flex-1 rounded-full px-5 py-3 text-sm focus:border-gold focus:outline-none border"
              style={{background:"var(--bg-card)",color:"var(--text)",borderColor: emailError ? "#C32A2E" : "var(--border)"}} />
            <button type="submit" disabled={subStatus==="sending"}
              className="btn-shine rounded-full bg-gradient-to-r from-red to-red/80 px-7 py-3 font-bold text-white text-sm shadow-lg shadow-red/30 disabled:opacity-50">
              {subStatus==="sending"?"Subscribing…":"Subscribe"}
            </button>
          </form>
          {emailError && <p className="mt-2 text-red text-sm">{emailError}</p>}
          {subStatus==="ok" && <p className="mt-3 text-green text-sm">✅ Subscribed! Check your inbox for a welcome email.</p>}
          {subStatus==="err" && !emailError && <p className="mt-3 text-red text-sm">❌ Something went wrong. Please try again.</p>}
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="eyebrow mb-2">Past Issues</p>
        <h2 className="font-display text-3xl mb-12" style={{color:"var(--text)"}}>Read previous newsletters</h2>
        {loadError ? (
          <p className="text-center py-16 text-red text-sm">
            Couldn't load newsletters ({loadError}). Check that <code>supabase/schema.sql</code> has been run and RLS is set up correctly.
          </p>
        ) : issues.length === 0 ? (
          <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No newsletters published yet. Check back soon!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map(i => <NewsCard key={i.id} issue={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
