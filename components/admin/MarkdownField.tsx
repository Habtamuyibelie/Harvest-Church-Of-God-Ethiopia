"use client";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold, Italic, Heading2, List, ListOrdered, Quote, Link2,
  Eye, EyeOff, SpellCheck2, Loader2, X,
} from "lucide-react";

type Match = {
  message: string;
  shortMessage?: string;
  context: { text: string };
  replacements: { value: string }[];
};

const TOOLBAR = [
  { Icon: Bold,        label: "Bold",         wrap: ["**", "**"] },
  { Icon: Italic,      label: "Italic",       wrap: ["_", "_"] },
  { Icon: Heading2,    label: "Heading",      wrap: ["## ", ""] },
  { Icon: List,        label: "Bullet list",  wrap: ["- ", ""] },
  { Icon: ListOrdered, label: "Numbered list",wrap: ["1. ", ""] },
  { Icon: Quote,       label: "Quote",        wrap: ["> ", ""] },
  { Icon: Link2,       label: "Link",         wrap: ["[", "](https://)"] },
] as const;

export default function MarkdownField({
  value, onChange, placeholder, rows = 8, className = "", style = {},
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [checked, setChecked] = useState(false);

  const insert = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  };

  const check = async () => {
    if (!value.trim()) return;
    setChecking(true); setChecked(false);
    try {
      const res = await fetch("/api/admin/grammar-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      setMatches(data.matches || []);
      setChecked(true);
    } catch { setMatches([]); setChecked(true); }
    finally { setChecking(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5 flex-wrap">
        {TOOLBAR.map(({ Icon, label, wrap }) => (
          <button
            key={label} type="button" title={label}
            onClick={() => insert(wrap[0], wrap[1])}
            className="p-1.5 rounded-lg border hover:border-gold/50 hover:text-gold transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Icon size={14} />
          </button>
        ))}
        <button
          type="button" onClick={() => setPreview((p) => !p)}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold hover:border-gold/50 hover:text-gold transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {preview ? <EyeOff size={13} /> : <Eye size={13} />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div
          className={`${className} prose-newsletter overflow-auto`}
          style={{ ...style, minHeight: `${rows * 1.6}rem` }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "*Nothing to preview yet.*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={ref}
          placeholder={placeholder}
          rows={rows}
          value={value}
          spellCheck
          lang="en"
          onChange={(e) => { onChange(e.target.value); if (checked) { setChecked(false); setMatches(null); } }}
          className={className}
          style={style}
        />
      )}

      <div className="flex items-center gap-3 mt-2">
        <button
          type="button" onClick={check} disabled={checking || !value.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold/70 disabled:opacity-40 transition-colors"
        >
          {checking ? <Loader2 size={13} className="animate-spin" /> : <SpellCheck2 size={13} />}
          {checking ? "Checking…" : "Check grammar & spelling"}
        </button>
        <span className="text-[0.68rem]" style={{ color: "var(--text-muted)" }}>Markdown supported — **bold**, _italic_, ## heading, - list, &gt; quote</span>
        {checked && matches && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {matches.length === 0 ? "No issues found ✓" : `${matches.length} suggestion${matches.length === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      {checked && matches && matches.length > 0 && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          {matches.map((m, i) => (
            <div key={i} className="text-xs leading-relaxed">
              <p style={{ color: "var(--text)" }}>{m.shortMessage || m.message}</p>
              <p style={{ color: "var(--text-muted)" }}>
                "…{m.context.text}…"
                {m.replacements[0] && <> — try <span className="text-gold font-semibold">{m.replacements[0].value}</span></>}
              </p>
            </div>
          ))}
          <button type="button" onClick={() => { setMatches(null); setChecked(false); }}
            className="flex items-center gap-1 text-[0.68rem] hover:text-gold transition-colors" style={{ color: "var(--text-muted)" }}>
            <X size={11} /> Dismiss suggestions
          </button>
        </div>
      )}
    </div>
  );
}
