"use client";
import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseKey(v: string) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function DatePicker({
  value, onChange, min, placeholder = "Select a date", error,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  placeholder?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? parseKey(value) : new Date()));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const minDate = min ? parseKey(min) : null;
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toKey(new Date());

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const isDisabled = (d: Date) => (minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false);

  const display = value
    ? parseKey(value).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })
    : placeholder;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm border text-left transition-colors"
        style={{
          background: "var(--bg-card)",
          color: value ? "var(--text)" : "var(--text-muted)",
          borderColor: error ? "#C32A2E" : "var(--border)",
        }}
      >
        <Calendar size={15} className="text-gold shrink-0" />
        {display}
      </button>
      {error && <p className="text-xs text-red mt-1">{error}</p>}

      {open && (
        <div
          className="glass absolute z-50 mt-2 w-72 rounded-2xl p-4 shadow-2xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gold/10 hover:text-gold transition-colors" style={{color:"var(--text-muted)"}}>
              <ChevronLeft size={16} />
            </button>
            <p className="font-display text-sm font-semibold" style={{ color: "var(--text)" }}>
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gold/10 hover:text-gold transition-colors" style={{color:"var(--text-muted)"}}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <span key={i} className="text-[0.65rem] font-semibold" style={{ color: "var(--text-muted)" }}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const key = toKey(d);
              const disabled = isDisabled(d);
              const selected = key === value;
              const isToday = key === todayKey;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(key); setOpen(false); }}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center
                    ${selected ? "bg-gold text-ink font-bold" : disabled ? "opacity-25 cursor-not-allowed" : "hover:bg-gold/15 hover:text-gold"}
                    ${isToday && !selected ? "ring-1 ring-gold/50" : ""}`}
                  style={!selected && !disabled ? { color: "var(--text)" } : {}}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
