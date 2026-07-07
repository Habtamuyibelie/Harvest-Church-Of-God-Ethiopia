"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, KeyRound, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminProfile() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "");
      setFullName((data.user?.user_metadata?.full_name as string) || "");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm border focus:border-gold focus:outline-none";
  const inputStyle = { background: "var(--bg)", color: "var(--text)", borderColor: "var(--border)" };

  const saveName = async () => {
    setSavingName(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSavingName(false);
    setMsg(error ? { type: "err", text: error.message } : { type: "ok", text: "Profile updated." });
  };

  const changePassword = async () => {
    setMsg(null);
    if (password.length < 8) { setMsg({ type: "err", text: "Password must be at least 8 characters." }); return; }
    if (password !== confirm) { setMsg({ type: "err", text: "Passwords do not match." }); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) { setMsg({ type: "err", text: error.message }); return; }
    setPassword(""); setConfirm("");
    setMsg({ type: "ok", text: "Password changed." });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:text-gold transition-colors" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <h1 className="font-display text-2xl mb-1">Your Profile</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>{email}</p>

        {msg && (
          <div className={`mb-6 text-sm rounded-xl p-3 border ${msg.type === "ok" ? "text-green bg-green/10 border-green/30" : "text-red bg-red/10 border-red/30"}`}>
            {msg.text}
          </div>
        )}

        {/* Display name */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="flex items-center gap-2 font-display text-lg mb-4"><User size={16} className="text-gold" /> Display Name</h2>
          <div className="flex gap-3">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className={inputCls} style={inputStyle} />
            <button onClick={saveName} disabled={savingName}
              className="btn-shine shrink-0 rounded-full bg-gradient-to-r from-red to-red/80 px-6 text-sm font-bold text-white disabled:opacity-50">
              {savingName ? <Loader2 size={15} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="glass rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-display text-lg mb-4"><KeyRound size={16} className="text-gold" /> Change Password</h2>
          <div className="space-y-3">
            <input type="password" placeholder="New password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={inputStyle} />
            <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} style={inputStyle} />
            <button onClick={changePassword} disabled={savingPassword}
              className="btn-shine rounded-full bg-gradient-to-r from-red to-red/80 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>

        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          To create additional admin accounts, add them in the Supabase dashboard under
          Authentication → Users — no code changes needed.
        </p>
      </div>
    </div>
  );
}
