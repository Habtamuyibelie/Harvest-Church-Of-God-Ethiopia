"use client";
import { useState } from "react";
import { Phone as PhoneIcon, Mail, MapPin, Clock, MailIcon } from "lucide-react";
import { useToast } from "@/components/Toast";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{name?:string; email?:string; message?:string}>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof fieldErrors = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email.";
    else if (!emailRe.test(form.email)) errs.email = "That doesn't look like a valid email.";
    if (!form.message.trim()) errs.message = "Please write a message.";
    setFieldErrors(errs);
    if (Object.keys(errs).length) { toast("Please fix the highlighted fields.", "error"); return; }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error || "Something went wrong."); setStatus("err");
        toast(json.error || "Something went wrong.", "error");
        return;
      }
      setStatus("ok"); setForm({ name: "", email: "", message: "" }); setFieldErrors({});
      toast("Message sent! We'll get back to you soon.", "success");
    } catch {
      setErrMsg("Network error. Please try again."); setStatus("err");
      toast("Network error. Please try again.", "error");
    }
  };

  return (
    <div className="text-parchment min-h-screen">
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 hero-veil" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <p className="eyebrow mb-3 flex items-center justify-center gap-2"><PhoneIcon size={13}/> Contact Us</p>
          <p className="font-display text-xl text-sky-500 mb-3">መከር የእግዚአብሔር ቤተ-ክርስቲያን - ኢትዮጲያ</p>
          <h1 className="font-display text-4xl sm:text-5xl text-parchment">We'd love to <span className="grad-text">hear from you.</span></h1>
        </div>
      </section>
      <hr className="divider-grad opacity-60" />
      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <p className="eyebrow mb-4">Visit, Call, or Write</p>
          {[
            { icon: <MapPin size={16}/>, label: "Address", value: "Shola Signal, Kenenisa Road, Addis Ababa, Ethiopia" },
            { icon: <PhoneIcon size={16}/>, label: "Phone", value: "+251 911 683 365" },
             { icon: <MailIcon size={16} />,label: "P.O. Box",value: "9134, Addis Ababa, Ethiopia"},
            { icon: <Mail size={16}/>, label: "Email", value: "fullVoiceet@gmail.com" },
          ].map(i => (
            <div key={i.label} className="glass rounded-xl p-4 flex gap-3 items-start">
              <span className="text-gold mt-0.5">{i.icon}</span>
              <div>
                <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-0.5">{i.label}</p>
                <p className="text-sm" style={{color:"var(--text)"}}>{i.value}</p>
              </div>
            </div>
          ))}
          <div className="glass rounded-xl p-4 flex gap-3 items-start">
            <span className="text-gold mt-0.5"><Clock size={16}/></span>
            <div>
              <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-1">Service Times</p>
              {["Sunday — 9:00 & 11:30 AM","Wednesday — 6:00 PM Bible Study","Friday — 5:30 PM Prayer"].map(t=>(
                <p key={t} className="text-sm" style={{color:"var(--text-muted)"}}>{t}</p>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-8 space-y-5">
          {status==="ok" && <div className="rounded-xl bg-green/10 border border-green/30 p-4 text-sm text-green">✅ Message sent! We'll get back to you soon.</div>}
          {status==="err" && <div className="rounded-xl bg-red/10 border border-red/30 p-4 text-sm text-red">❌ {errMsg}</div>}
          {[{id:"name",label:"Full name",type:"text",ph:"Your name"},{id:"email",label:"Email",type:"email",ph:"you@example.com"}].map(f=>(
            <div key={f.id}>
              <label className="block text-sm font-semibold mb-1.5" style={{color:"var(--text-muted)"}} htmlFor={f.id}>{f.label}</label>
              <input id={f.id} type={f.type} placeholder={f.ph} value={form[f.id as keyof typeof form]}
                onChange={e=>setForm(p=>({...p,[f.id]:e.target.value}))}
                aria-invalid={!!fieldErrors[f.id as keyof typeof fieldErrors]}
                className="w-full rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none border"
                style={{background:"var(--bg)",color:"var(--text)",borderColor: fieldErrors[f.id as keyof typeof fieldErrors] ? "#C32A2E" : "var(--border)"}} />
              {fieldErrors[f.id as keyof typeof fieldErrors] && (
                <p className="text-red text-xs mt-1">{fieldErrors[f.id as keyof typeof fieldErrors]}</p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{color:"var(--text-muted)"}} htmlFor="message">Message</label>
            <textarea id="message" rows={5} placeholder="How can we help?" value={form.message}
              onChange={e=>setForm(p=>({...p,message:e.target.value}))}
              aria-invalid={!!fieldErrors.message}
              className="w-full rounded-xl px-4 py-3 text-sm focus:border-gold focus:outline-none border"
              style={{background:"var(--bg)",color:"var(--text)",borderColor: fieldErrors.message ? "#C32A2E" : "var(--border)"}} />
            {fieldErrors.message && <p className="text-red text-xs mt-1">{fieldErrors.message}</p>}
          </div>
          <button type="submit" disabled={status==="sending"}
            className="btn-shine w-full flex items-center justify-center rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-3.5 font-bold text-white shadow-lg shadow-red/30 hover:shadow-red/50 transition-all disabled:opacity-50">
            {status==="sending"?"Sending…":"Send Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
