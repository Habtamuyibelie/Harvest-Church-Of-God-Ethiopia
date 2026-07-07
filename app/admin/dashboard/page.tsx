"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Users, Image as ImgIcon, Bell, Calendar, Mic2,
  LogOut, CheckCircle, Trash2, Plus, Eye, EyeOff, Send, UserCog, Loader2,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { supabasePublic } from "@/lib/supabase/public";
import MarkdownField from "@/components/admin/MarkdownField";
import SpellcheckField from "@/components/admin/SpellcheckField";
import DatePicker from "@/components/admin/DatePicker";
import { useToast } from "@/components/Toast";

// ── Types ─────────────────────────────────────────────────────────────────
type Tab = "messages"|"subscribers"|"newsletter"|"gallery"|"events"|"sermons";
type Msg  = { id:string; name:string; email:string; message:string; is_read:boolean; created_at:string; };
type Sub  = { id:string; email:string; status:string; subscribed_at:string; };
type Issue = { id:string; title:string; amharic?:string; tag:string; preview:string; content:string; author_name?:string; image_url?:string; published:boolean; created_at:string; };
type GImg = { id:string; album:string; caption?:string; storage_path:string; url:string; created_at:string; };
type Evt  = { id:string; title:string; event_date:string; event_time?:string; location?:string; description?:string; is_published?:boolean; };
type Serm = { id:string; title:string; pastor_name:string; sermon_date:string; youtube_url:string; description?:string; is_published?:boolean; };

// ── Helpers ───────────────────────────────────────────────────────────────
const api = async (url: string, opts?: RequestInit) => {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(j.error || `Request failed (${r.status}).`) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
  return j;
};

// ── Stat card ─────────────────────────────────────────────────────────────
function Stat({ icon, label, value, color }: { icon:React.ReactNode; label:string; value:number; color:string }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <span className={`p-3 rounded-xl ${color}`}>{icon}</span>
      <div>
        <p className="text-2xl font-bold font-display" style={{color:"var(--text)"}}>{value}</p>
        <p className="text-xs" style={{color:"var(--text-muted)"}}>{label}</p>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab]   = useState<Tab>("messages");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [gallery, setGallery] = useState<GImg[]>([]);
  const [events, setEvents]   = useState<Evt[]>([]);
  const [sermons, setSermons] = useState<Serm[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const notify = (msg: string, type: "success"|"error" = "success") => toast(msg, type);
  const notifyError = (e: unknown) =>
    notify(e instanceof Error ? e.message : "Something went wrong.", "error");

  const [publicCheck, setPublicCheck] = useState<{expected:number; actual:number; error?:string} | null>(null);
  const [sermonPublicCheck, setSermonPublicCheck] = useState<{expected:number; actual:number; error?:string} | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "messages")    setMsgs(await api("/api/admin/messages"));
      if (t === "subscribers") setSubs(await api("/api/admin/subscribers"));
      if (t === "newsletter")  setIssues(await api("/api/admin/newsletter"));
      if (t === "gallery")     setGallery(await api("/api/admin/gallery"));
      if (t === "sermons") {
        const data: Serm[] = await api("/api/admin/sermons");
        setSermons(data);
        const expected = data.filter(s => s.is_published !== false).length;
        const { count, error } = await supabasePublic
          .from("sermons").select("id", { count: "exact", head: true })
          .eq("is_published", true);
        setSermonPublicCheck({ expected, actual: count ?? 0, error: error?.message });
      }
      if (t === "events") {
        const data: Evt[] = await api("/api/admin/events");
        setEvents(data);
        const today = new Date().toISOString().slice(0,10);
        const expected = data.filter(e => e.is_published !== false && e.event_date >= today).length;
        const { count, error } = await supabasePublic
          .from("events").select("id", { count: "exact", head: true })
          .eq("is_published", true).gte("event_date", today);
        setPublicCheck({ expected, actual: count ?? 0, error: error?.message });
      }
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 401) { router.push("/admin"); return; }
      notify(e instanceof Error ? e.message : "Failed to load data.", "error");
    }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(tab); }, [tab, load]);

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/admin");
  };

  // Messages
  const markRead = async (id: string) => {
    try {
      await api("/api/admin/messages", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setMsgs(p => p.map(m => m.id===id ? {...m,is_read:true} : m));
      notify("Marked as read");
    } catch (e) { notifyError(e); }
  };
  const deleteMsg = async (id: string) => {
    try {
      await api("/api/admin/messages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setMsgs(p => p.filter(m => m.id!==id)); notify("Deleted");
    } catch (e) { notifyError(e); }
  };

  // Subscribers
  const deleteSub = async (id: string) => {
    try {
      await api("/api/admin/subscribers", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setSubs(p => p.filter(s => s.id!==id)); notify("Removed subscriber");
    } catch (e) { notifyError(e); }
  };

  // Newsletter
  const [newIssue, setNewIssue] = useState({ title:"",amharic:"",tag:"Church Life",preview:"",content:"",author_name:"",image_url:"" });
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [uploadingIssueImg, setUploadingIssueImg] = useState(false);
  const [issueErrors, setIssueErrors] = useState<{title?:string; preview?:string; content?:string}>({});

  const uploadIssueImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Please choose an image file.", "error"); e.target.value=""; return; }
    if (file.size > 8 * 1024 * 1024) { notify("Image must be under 8MB.", "error"); e.target.value=""; return; }
    setUploadingIssueImg(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const data = await api("/api/admin/newsletter/image", { method:"POST", body:fd });
      setNewIssue(p => ({...p, image_url: data.url}));
    } catch (err) { notifyError(err); }
    finally { setUploadingIssueImg(false); e.target.value=""; }
  };

  const createIssue = async () => {
    const errs: typeof issueErrors = {};
    if (!newIssue.title.trim()) errs.title = "Title is required.";
    if (!newIssue.preview.trim()) errs.preview = "A short preview is required.";
    if (!newIssue.content.trim()) errs.content = "Content is required.";
    setIssueErrors(errs);
    if (Object.keys(errs).length) { notify("Please fix the highlighted fields.", "error"); return; }
    try {
      const data = await api("/api/admin/newsletter", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newIssue),
      });
      setIssues(p => [data, ...p]);
      setNewIssue({title:"",amharic:"",tag:"Church Life",preview:"",content:"",author_name:"",image_url:""});
      setIssueErrors({});
      setShowNewIssue(false); notify("Newsletter issue created");
    } catch (e) { notifyError(e); }
  };
  const togglePublish = async (issue: Issue) => {
    try {
      const data = await api("/api/admin/newsletter", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:issue.id, published:!issue.published}),
      });
      setIssues(p => p.map(i => i.id===issue.id ? data : i));
      notify(data.published ? `Published & sent to ${subs.filter(s=>s.status==="active").length} subscribers` : "Unpublished");
    } catch (e) { notifyError(e); }
  };
  const deleteIssue = async (id: string) => {
    try {
      await api("/api/admin/newsletter", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setIssues(p => p.filter(i => i.id!==id)); notify("Deleted");
    } catch (e) { notifyError(e); }
  };

  // Gallery upload
  const [newImgAlbum, setNewImgAlbum] = useState("");
  const [newImgCaption, setNewImgCaption] = useState("");

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, album: string, caption: string = "") => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Please choose an image file.", "error"); e.target.value=""; return; }
    if (file.size > 8 * 1024 * 1024) { notify("Image must be under 8MB.", "error"); e.target.value=""; return; }
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("album", album); fd.append("caption", caption);
      const data = await api("/api/admin/gallery", { method:"POST", body:fd });
      setGallery(p => [data, ...p]);
      setNewImgCaption("");
      notify("Image uploaded");
    } catch (e) { notifyError(e); }
    finally { e.target.value = ""; }
  };
  const deleteImg = async (img: GImg) => {
    try {
      await api("/api/admin/gallery", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:img.id,storage_path:img.storage_path}) });
      setGallery(p => p.filter(i => i.id!==img.id)); notify("Image deleted");
    } catch (e) { notifyError(e); }
  };

  // Events
  const [newEvt, setNewEvt] = useState({ title:"",event_date:"",event_time:"",location:"",description:"" });
  const [showNewEvt, setShowNewEvt] = useState(false);
  const [evtErrors, setEvtErrors] = useState<{title?:string; event_date?:string}>({});
  const todayISO = new Date().toISOString().slice(0,10);

  const createEvent = async () => {
    const errs: typeof evtErrors = {};
    if (!newEvt.title.trim()) errs.title = "Title is required.";
    if (!newEvt.event_date) errs.event_date = "Date is required.";
    else if (newEvt.event_date < todayISO) errs.event_date = "Event date must be today or in the future.";
    setEvtErrors(errs);
    if (Object.keys(errs).length) { notify("Please fix the highlighted fields.", "error"); return; }
    try {
      const data = await api("/api/admin/events", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newEvt),
      });
      setEvents(p => [...p, data].sort((a,b)=>a.event_date.localeCompare(b.event_date)));
      setNewEvt({title:"",event_date:"",event_time:"",location:"",description:""});
      setEvtErrors({});
      setShowNewEvt(false); notify("Event created");
    } catch (e) { notifyError(e); }
  };
  const deleteEvt = async (id: string) => {
    try {
      await api("/api/admin/events", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setEvents(p => p.filter(e => e.id!==id)); notify("Deleted");
    } catch (e) { notifyError(e); }
  };

  // Sermons
  const [newSerm, setNewSerm] = useState({ title:"",pastor_name:"",sermon_date:"",youtube_url:"",description:"" });
  const [showNewSerm, setShowNewSerm] = useState(false);
  const [sermErrors, setSermErrors] = useState<{title?:string; pastor_name?:string; sermon_date?:string}>({});

  const createSermon = async () => {
    const errs: typeof sermErrors = {};
    if (!newSerm.title.trim()) errs.title = "Title is required.";
    if (!newSerm.pastor_name.trim()) errs.pastor_name = "Pastor's name is required.";
    if (!newSerm.sermon_date) errs.sermon_date = "Date is required.";
    setSermErrors(errs);
    if (Object.keys(errs).length) { notify("Please fix the highlighted fields.", "error"); return; }
    try {
      const data = await api("/api/admin/sermons", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newSerm),
      });
      setSermons(p => [data, ...p]);
      setNewSerm({title:"",pastor_name:"",sermon_date:"",youtube_url:"",description:""});
      setSermErrors({});
      setShowNewSerm(false); notify("Sermon added");
    } catch (e) { notifyError(e); }
  };
  const deleteSermon = async (id: string) => {
    try {
      await api("/api/admin/sermons", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
      setSermons(p => p.filter(s => s.id!==id)); notify("Deleted");
    } catch (e) { notifyError(e); }
  };

  const tabs: { id:Tab; icon:React.ReactNode; label:string; count:number }[] = [
    { id:"messages",    icon:<Mail size={16}/>,     label:"Messages",    count:msgs.filter(m=>!m.is_read).length },
    { id:"subscribers", icon:<Users size={16}/>,    label:"Subscribers", count:subs.filter(s=>s.status==="active").length },
    { id:"newsletter",  icon:<Bell size={16}/>,     label:"Newsletter",  count:issues.length },
    { id:"gallery",     icon:<ImgIcon size={16}/>,  label:"Gallery",     count:gallery.length },
    { id:"events",      icon:<Calendar size={16}/>, label:"Events",      count:events.length },
    { id:"sermons",     icon:<Mic2 size={16}/>,     label:"Sermons",     count:sermons.length },
  ];

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm border focus:border-gold focus:outline-none";
  const inputStyle = {background:"var(--bg)",color:"var(--text)",borderColor:"var(--border)"};
  const errStyle = (hasError?: string) => hasError ? {...inputStyle, borderColor:"#C32A2E"} : inputStyle;

  return (
    <div className="min-h-screen" style={{background:"var(--bg)",color:"var(--text)"}}>

      {/* Top bar */}
      <div className="border-b sticky top-0 z-40 backdrop-blur-xl" style={{borderColor:"var(--border)",background:"var(--nav-bg)"}}>
        <div className="mx-auto max-w-7xl px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.jpg" alt="logo" className="h-9 w-9 rounded-full ring-2 ring-gold/50 object-cover" />
            <div>
              <p className="font-display font-bold text-[0.95rem]" style={{color:"var(--text)"}}>Admin Dashboard</p>
              <p className="text-[0.68rem] text-gold">Harvest Church of God Ethiopia</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/profile" className="flex items-center gap-1.5 text-sm hover:text-gold transition-colors font-semibold" style={{color:"var(--text-muted)"}}>
              <UserCog size={15}/> Profile
            </a>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-red hover:text-red/70 transition-colors font-semibold">
              <LogOut size={15}/> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <Stat icon={<Mail size={18} className="text-red"/>}     label="Unread msgs"     value={msgs.filter(m=>!m.is_read).length}     color="bg-red/10" />
          <Stat icon={<Users size={18} className="text-blue"/>}   label="Active subs"     value={subs.filter(s=>s.status==="active").length} color="bg-blue/10" />
          <Stat icon={<Bell size={18} className="text-gold"/>}    label="Newsletters"     value={issues.filter(i=>i.published).length}  color="bg-gold/10" />
          <Stat icon={<ImgIcon size={18} className="text-green"/>}label="Gallery images"  value={gallery.length}                        color="bg-green/10" />
          <Stat icon={<Calendar size={18} className="text-red"/>} label="Events"          value={events.length}                         color="bg-red/10" />
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${tab===t.id ? "bg-gradient-to-r from-red to-red/80 text-white shadow-md shadow-red/25" : "glass hover:border-gold/20"}`}
              style={tab!==t.id?{color:"var(--text-muted)"}:{}}>
              {t.icon} {t.label}
              {t.count > 0 && <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold ${tab===t.id?"bg-white/20":"bg-gold/20 text-gold"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20" style={{color:"var(--text-muted)"}}>Loading…</div>
        ) : (
          <>
            {/* ── MESSAGES ── */}
            {tab === "messages" && (
              <div className="space-y-3">
                {msgs.length === 0 && <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No messages yet.</p>}
                {msgs.map(m => (
                  <div key={m.id} className={`glass rounded-2xl p-5 ${!m.is_read?"border-l-4 border-gold":""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold" style={{color:"var(--text)"}}>{m.name}</span>
                          <span className="text-xs" style={{color:"var(--text-muted)"}}>{m.email}</span>
                          {!m.is_read && <span className="text-[0.6rem] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold uppercase">New</span>}
                        </div>
                        <p className="text-sm leading-relaxed" style={{color:"var(--text-muted)"}}>{m.message}</p>
                        <p className="text-xs mt-2" style={{color:"var(--text-muted)"}}>{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!m.is_read && (
                          <button onClick={()=>markRead(m.id)} title="Mark read"
                            className="p-2 rounded-xl bg-green/10 text-green hover:bg-green/20 transition-colors">
                            <CheckCircle size={15}/>
                          </button>
                        )}
                        <button onClick={()=>deleteMsg(m.id)} title="Delete"
                          className="p-2 rounded-xl bg-red/10 text-red hover:bg-red/20 transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SUBSCRIBERS ── */}
            {tab === "subscribers" && (
              <div>
                <p className="text-sm mb-4 font-semibold" style={{color:"var(--text-muted)"}}>
                  {subs.filter(s=>s.status==="active").length} active · {subs.filter(s=>s.status==="unsubscribed").length} unsubscribed
                </p>
                <div className="glass rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{borderColor:"var(--border)"}}>
                        <th className="text-left px-5 py-3 font-semibold" style={{color:"var(--text-muted)"}}>Email</th>
                        <th className="text-left px-5 py-3 font-semibold" style={{color:"var(--text-muted)"}}>Status</th>
                        <th className="text-left px-5 py-3 font-semibold" style={{color:"var(--text-muted)"}}>Subscribed</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map(s => (
                        <tr key={s.id} className="border-b last:border-0" style={{borderColor:"var(--border)"}}>
                          <td className="px-5 py-3" style={{color:"var(--text)"}}>{s.email}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[0.68rem] px-2 py-0.5 rounded-full font-bold uppercase
                              ${s.status==="active" ? "bg-green/15 text-green" : "bg-red/15 text-red"}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs" style={{color:"var(--text-muted)"}}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={()=>deleteSub(s.id)} className="p-1.5 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors">
                              <Trash2 size={13}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {subs.length===0 && <p className="text-center py-10" style={{color:"var(--text-muted)"}}>No subscribers yet.</p>}
                </div>
              </div>
            )}

            {/* ── NEWSLETTER ── */}
            {tab === "newsletter" && (
              <div>
                <button onClick={()=>setShowNewIssue(!showNewIssue)}
                  className="btn-shine mb-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-5 py-2.5 text-sm font-bold text-white">
                  <Plus size={15}/> New Issue
                </button>
                {showNewIssue && (
                  <div className="glass rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="font-display text-lg" style={{color:"var(--text)"}}>New Newsletter Issue</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <input placeholder="Title (English)" value={newIssue.title} onChange={e=>setNewIssue(p=>({...p,title:e.target.value}))} className={inputCls} style={errStyle(issueErrors.title)} aria-invalid={!!issueErrors.title}/>
                        {issueErrors.title && <p className="text-red text-xs mt-1">{issueErrors.title}</p>}
                      </div>
                      <input placeholder="Title (Amharic — optional)" value={newIssue.amharic} onChange={e=>setNewIssue(p=>({...p,amharic:e.target.value}))} className={inputCls} style={inputStyle}/>
                    </div>
                    <select value={newIssue.tag} onChange={e=>setNewIssue(p=>({...p,tag:e.target.value}))} className={inputCls} style={inputStyle}>
                      {["Church Life","Youth","Celebration","Missions","Events"].map(t=><option key={t}>{t}</option>)}
                    </select>
                    <input placeholder="Published by (e.g. Pastor Yohannes, Communications Team)" value={newIssue.author_name} onChange={e=>setNewIssue(p=>({...p,author_name:e.target.value}))} className={inputCls} style={inputStyle}/>

                    <div>
                      <label className="text-sm font-semibold block mb-1.5" style={{color:"var(--text-muted)"}}>Cover image (optional)</label>
                      {newIssue.image_url ? (
                        <div className="relative inline-block">
                          <img src={newIssue.image_url} alt="" className="h-24 w-40 object-cover rounded-lg" />
                          <button type="button" onClick={()=>setNewIssue(p=>({...p,image_url:""}))}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-red text-white"><Trash2 size={11}/></button>
                        </div>
                      ) : (
                        <label className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer hover:border-gold/30" style={{color:"var(--text-muted)"}}>
                          {uploadingIssueImg ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
                          {uploadingIssueImg ? "Uploading…" : "Upload cover image"}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingIssueImg} onChange={uploadIssueImage}/>
                        </label>
                      )}
                    </div>

                    <div>
                      <textarea placeholder="Preview (1–2 sentences shown before 'Read More')" rows={2} value={newIssue.preview} onChange={e=>setNewIssue(p=>({...p,preview:e.target.value}))} className={inputCls} style={errStyle(issueErrors.preview)} aria-invalid={!!issueErrors.preview}/>
                      {issueErrors.preview && <p className="text-red text-xs mt-1">{issueErrors.preview}</p>}
                    </div>
                    <MarkdownField
                      placeholder="Full content (shown after 'Read More') — supports markdown"
                      rows={8}
                      value={newIssue.content}
                      onChange={v=>setNewIssue(p=>({...p,content:v}))}
                      className={inputCls}
                      style={errStyle(issueErrors.content)}
                    />
                    {issueErrors.content && <p className="text-red text-xs -mt-2">{issueErrors.content}</p>}

                    <div className="flex gap-3">
                      <button onClick={createIssue} className="btn-shine rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-2.5 text-sm font-bold text-white">Save Draft</button>
                      <button onClick={()=>setShowNewIssue(false)} className="glass rounded-full px-6 py-2.5 text-sm font-semibold" style={{color:"var(--text-muted)"}}>Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {issues.map(i => (
                    <div key={i.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-lg" style={{color:"var(--text)"}}>{i.title}</span>
                          <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase ${i.published?"bg-green/15 text-green":"bg-gold/15 text-gold"}`}>
                            {i.published?"Published":"Draft"}
                          </span>
                        </div>
                        {i.amharic && <p className="text-sm text-gold italic">{i.amharic}</p>}
                        <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>{i.preview}</p>
                        <p className="text-xs mt-2" style={{color:"var(--text-muted)"}}>{new Date(i.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={()=>togglePublish(i)} title={i.published?"Unpublish":"Publish & Send"}
                          className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold px-3
                            ${i.published?"bg-gold/10 text-gold hover:bg-gold/20":"bg-green/10 text-green hover:bg-green/20"}`}>
                          {i.published ? <><EyeOff size={13}/> Unpublish</> : <><Send size={13}/> Publish & Send</>}
                        </button>
                        <button onClick={()=>deleteIssue(i.id)} className="p-2 rounded-xl bg-red/10 text-red hover:bg-red/20 transition-colors">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {issues.length===0 && <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No issues yet. Create your first one above.</p>}
                </div>
              </div>
            )}

            {/* ── GALLERY ── */}
            {tab === "gallery" && (
              <div>
                <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{color:"var(--text-muted)"}}>Category / Album</label>
                    <input list="gallery-albums" placeholder="e.g. Sunday Service, Youth Camp" value={newImgAlbum}
                      onChange={e=>setNewImgAlbum(e.target.value)} className={inputCls} style={{...inputStyle, width:220}}/>
                    <datalist id="gallery-albums">
                      {Array.from(new Set(gallery.map(g=>g.album))).map(a=><option key={a} value={a}/>)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{color:"var(--text-muted)"}}>Title / caption (optional)</label>
                    <input placeholder="What is this photo of?" value={newImgCaption}
                      onChange={e=>setNewImgCaption(e.target.value)} className={inputCls} style={{...inputStyle, width:240}}/>
                  </div>
                  <label className="btn-shine flex items-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-5 py-2.5 text-sm font-bold text-white cursor-pointer">
                    <Plus size={15}/> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={e=>uploadImage(e, newImgAlbum||"General", newImgCaption)}/>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {gallery.map(img => (
                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden">
                      <img src={img.url} alt={img.caption||img.album} className="w-full h-full object-cover"/>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col justify-end p-2">
                        <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{img.caption || img.album}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-[0.65rem] opacity-0 group-hover:opacity-100 transition-opacity">{img.album}</span>
                          <button onClick={()=>deleteImg(img)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red text-white transition-opacity">
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {gallery.length===0 && <p className="col-span-4 text-center py-16" style={{color:"var(--text-muted)"}}>No images uploaded yet.</p>}
                </div>
              </div>
            )}


            {/* ── EVENTS ── */}
            {tab === "events" && (
              <div>
                {publicCheck && (
                  publicCheck.error ? (
                    <div className="mb-5 rounded-xl border border-red/30 bg-red/10 p-4 text-sm text-red">
                      ⚠️ Public visitors can't read events at all.
                    </div>
                  ) : publicCheck.actual < publicCheck.expected ? (
                    <div className="mb-5 rounded-xl border border-red/30 bg-red/10 p-4 text-sm text-red">
                      ⚠️ You have <strong>{publicCheck.expected}</strong> upcoming, published event{publicCheck.expected===1?"":"s"},
                      but the public site can only see <strong>{publicCheck.actual}</strong>. Row Level
                      Security is blocking the rest — re-run the current <code>supabase/schema.sql</code> in
                      your Supabase SQL editor (it's safe to run again) to fix the read policy.
                    </div>
                  ) : publicCheck.expected > 0 ? (
                    <div className="mb-5 rounded-xl border border-green/30 bg-green/10 p-4 text-sm text-green">
                      ✅ Public visibility check passed.
                    </div>
                  ) : null
                )}
                <button onClick={()=>setShowNewEvt(!showNewEvt)}
                  className="btn-shine mb-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-5 py-2.5 text-sm font-bold text-white">
                  <Plus size={15}/> New Event
                </button>
                {showNewEvt && (
                  <div className="glass rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="font-display text-lg" style={{color:"var(--text)"}}>New Event</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <input placeholder="Event title" value={newEvt.title}
                          onChange={e=>setNewEvt(p=>({...p,title:e.target.value}))}
                          className={inputCls} style={errStyle(evtErrors.title)}
                          aria-invalid={!!evtErrors.title}/>
                        {evtErrors.title && <p className="text-red text-xs mt-1">{evtErrors.title}</p>}
                      </div>
                      <div>
                        <DatePicker
                          value={newEvt.event_date}
                          onChange={(v)=>setNewEvt(p=>({...p,event_date:v}))}
                          min={todayISO}
                          placeholder="Select event date"
                          error={evtErrors.event_date}
                        />
                      </div>
                      <input placeholder="Time (e.g. 10:00 AM)" value={newEvt.event_time} onChange={e=>setNewEvt(p=>({...p,event_time:e.target.value}))} className={inputCls} style={inputStyle}/>
                      <input placeholder="Location" value={newEvt.location} onChange={e=>setNewEvt(p=>({...p,location:e.target.value}))} className={inputCls} style={inputStyle}/>
                    </div>
                    <textarea placeholder="Description" rows={3} value={newEvt.description} onChange={e=>setNewEvt(p=>({...p,description:e.target.value}))} className={inputCls} style={inputStyle}/>
                    <div className="flex gap-3">
                      <button onClick={createEvent} className="btn-shine rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-2.5 text-sm font-bold text-white">Save Event</button>
                      <button onClick={()=>setShowNewEvt(false)} className="glass rounded-full px-6 py-2.5 text-sm font-semibold" style={{color:"var(--text-muted)"}}>Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {events.map(e => (
                    <div key={e.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="text-center bg-red/10 border border-red/20 rounded-xl px-3 py-2 shrink-0">
                          <p className="font-display text-2xl text-red leading-none">{new Date(e.event_date + "T00:00:00").getDate()}</p>
                          <p className="text-[0.65rem] tracking-wider" style={{color:"var(--text-muted)"}}>{new Date(e.event_date + "T00:00:00").toLocaleDateString("en-US",{month:"short"}).toUpperCase()}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-display text-lg" style={{color:"var(--text)"}}>{e.title}</p>
                            <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase ${e.is_published===false ? "bg-red/15 text-red" : "bg-green/15 text-green"}`}>
                              {e.is_published===false ? "Hidden" : "Live"}
                            </span>
                            {e.event_date < todayISO && (
                              <span className="text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase bg-gold/15 text-gold">Past — not shown on /events</span>
                            )}
                          </div>
                          {e.event_time && <p className="text-sm text-gold">{e.event_time}</p>}
                          {e.location && <p className="text-sm" style={{color:"var(--text-muted)"}}>{e.location}</p>}
                          {e.description && <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>{e.description}</p>}
                        </div>
                      </div>
                      <button onClick={()=>deleteEvt(e.id)} className="p-2 rounded-xl bg-red/10 text-red hover:bg-red/20 transition-colors shrink-0">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  ))}
                  {events.length===0 && <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No events. Add your first above.</p>}
                </div>
              </div>
            )}

            {/* ── SERMONS ── */}
            {tab === "sermons" && (
              <div>
                {sermonPublicCheck && (
                  sermonPublicCheck.error ? (
                    <div className="mb-5 rounded-xl border border-red/30 bg-red/10 p-4 text-sm text-red">
                      ⚠️ Public visitors can't read sermons at all.
                    </div>
                  ) : sermonPublicCheck.actual < sermonPublicCheck.expected ? (
                    <div className="mb-5 rounded-xl border border-red/30 bg-red/10 p-4 text-sm text-red">
                      ⚠️ You have <strong>{sermonPublicCheck.expected}</strong> published sermon{sermonPublicCheck.expected===1?"":"s"},
                      but the public site can only see <strong>{sermonPublicCheck.actual}</strong>. Row Level
                      Security is blocking the rest — re-run the current <code>supabase/schema.sql</code> in
                      your Supabase SQL editor (it's safe to run again) to fix the read policy.
                    </div>
                  ) : sermonPublicCheck.expected > 0 ? (
                    <div className="mb-5 rounded-xl border border-green/30 bg-green/10 p-4 text-sm text-green">
                      ✅ Public visibility check passed.
                    </div>
                  ) : null
                )}
                <button onClick={()=>setShowNewSerm(!showNewSerm)}
                  className="btn-shine mb-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-red to-red/80 px-5 py-2.5 text-sm font-bold text-white">
                  <Plus size={15}/> New Sermon
                </button>
                {showNewSerm && (
                  <div className="glass rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="font-display text-lg" style={{color:"var(--text)"}}>New Sermon</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <input placeholder="Sermon title" value={newSerm.title} onChange={e=>setNewSerm(p=>({...p,title:e.target.value}))} className={inputCls} style={errStyle(sermErrors.title)} aria-invalid={!!sermErrors.title}/>
                        {sermErrors.title && <p className="text-red text-xs mt-1">{sermErrors.title}</p>}
                      </div>
                      <div>
                        <input placeholder="Pastor's name" value={newSerm.pastor_name} onChange={e=>setNewSerm(p=>({...p,pastor_name:e.target.value}))} className={inputCls} style={errStyle(sermErrors.pastor_name)} aria-invalid={!!sermErrors.pastor_name}/>
                        {sermErrors.pastor_name && <p className="text-red text-xs mt-1">{sermErrors.pastor_name}</p>}
                      </div>
                      <DatePicker
                        value={newSerm.sermon_date}
                        onChange={(v)=>setNewSerm(p=>({...p,sermon_date:v}))}
                        placeholder="Select sermon date"
                        error={sermErrors.sermon_date}
                      />
                      <input placeholder="YouTube link (https://youtube.com/watch?v=...)" value={newSerm.youtube_url} onChange={e=>setNewSerm(p=>({...p,youtube_url:e.target.value}))} className={inputCls} style={inputStyle}/>
                    </div>
                    <SpellcheckField
                      placeholder="Description (optional)"
                      rows={3}
                      value={newSerm.description}
                      onChange={v=>setNewSerm(p=>({...p,description:v}))}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <div className="flex gap-3">
                      <button onClick={createSermon} className="btn-shine rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-2.5 text-sm font-bold text-white">Save Sermon</button>
                      <button onClick={()=>setShowNewSerm(false)} className="glass rounded-full px-6 py-2.5 text-sm font-semibold" style={{color:"var(--text-muted)"}}>Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {sermons.map(s => (
                    <div key={s.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <span className="p-3 rounded-xl bg-red/10 text-red shrink-0"><Mic2 size={18}/></span>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-display text-lg" style={{color:"var(--text)"}}>{s.title}</p>
                            <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase ${s.is_published===false ? "bg-red/15 text-red" : "bg-green/15 text-green"}`}>
                              {s.is_published===false ? "Hidden" : "Live"}
                            </span>
                          </div>
                          <p className="text-sm text-gold">{s.pastor_name} · {new Date(s.sermon_date + "T00:00:00").toLocaleDateString()}</p>
                          {s.description && <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>{s.description}</p>}
                          <a href={s.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-blue hover:underline break-all">{s.youtube_url}</a>
                        </div>
                      </div>
                      <button onClick={()=>deleteSermon(s.id)} className="p-2 rounded-xl bg-red/10 text-red hover:bg-red/20 transition-colors shrink-0">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  ))}
                  {sermons.length===0 && <p className="text-center py-16" style={{color:"var(--text-muted)"}}>No sermons yet. Add your first above.</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
