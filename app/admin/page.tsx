"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    if (error) { setErr("Invalid email or password."); setLoading(false); return; }
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:"var(--bg)"}}>
      <div className="glass rounded-2xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-gold">
            <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-2xl" style={{color:"var(--text)"}}>Admin Login</h1>
          <p className="text-sm mt-1" style={{color:"var(--text-muted)"}}>Harvest Church of God Ethiopia</p>
        </div>
        {err && <div className="mb-4 text-sm text-red bg-red/10 border border-red/30 rounded-xl p-3">{err}</div>}
        <form onSubmit={login} className="space-y-4">
          <input type="email" placeholder="admin@church.org" required value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm border focus:border-gold focus:outline-none"
            style={{background:"var(--bg)",color:"var(--text)",borderColor:"var(--border)"}} />
          <input type="password" placeholder="Password" required value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-sm border focus:border-gold focus:outline-none"
            style={{background:"var(--bg)",color:"var(--text)",borderColor:"var(--border)"}} />
          <button type="submit" disabled={loading}
            className="btn-shine w-full rounded-full bg-gradient-to-r from-red to-red/80 py-3.5 font-bold text-white shadow-lg shadow-red/30 disabled:opacity-50">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-xs mt-6" style={{color:"var(--text-muted)"}}>
          Admin accounts are created in the Supabase dashboard, not here.
        </p>
      </div>
    </div>
  );
}
