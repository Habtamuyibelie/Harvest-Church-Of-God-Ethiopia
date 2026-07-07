"use client";
import { useState } from "react";
import { SpellCheck2, Loader2, X } from "lucide-react";

type Match = {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  context: { text: string; offset: number; length: number };
  replacements: { value: string }[];
};

export default function SpellcheckField({
  value, onChange, placeholder, rows = 5, className = "", style = {},
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [checking, setChecking] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [checked, setChecked] = useState(false);

  const check = async () => {
    if (!value.trim()) return;
    setChecking(true); setChecked(false);
    try {
      const res = await fetch("/api/admin/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      setMatches(data.matches || []);
      setChecked(true);
    } catch {
      setMatches([]);
      setChecked(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        spellCheck
        lang="en"
        onChange={(e) => { onChange(e.target.value); if (checked) { setChecked(false); setMatches(null); } }}
        className={className}
        style={style}
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={check}
          disabled={checking || !value.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/70 disabled:opacity-40 transition-colors"
        >
          {checking ? <Loader2 size={13} className="animate-spin" /> : <SpellCheck2 size={13} />}
          {checking ? "Checking…" : "Check grammar & spelling"}
        </button>
        {checked && matches && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {matches.length === 0 ? "No issues found ✓" : `${matches.length} suggestion${matches.length === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      {checked && matches && matches.length > 0 && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          {matches.map((m, i) => (
            <div key={i} className="text-xs leading-relaxed flex items-start justify-between gap-2">
              <div>
                <p style={{ color: "var(--text)" }}>{m.shortMessage || m.message}</p>
                <p style={{ color: "var(--text-muted)" }}>
                  "…{m.context.text}…"
                  {m.replacements[0] && (
                    <> — try <span className="text-gold font-semibold">{m.replacements[0].value}</span></>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {checked && matches && matches.length > 0 && (
        <button
          type="button"
          onClick={() => { setMatches(null); setChecked(false); }}
          className="flex items-center gap-1 text-[0.68rem] mt-1 hover:text-gold transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={11} /> Dismiss suggestions
        </button>
      )}
    </div>
  );
}
