"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType; duration: number };

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType, duration?: number) => void;
}>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const STYLES: Record<ToastType, { Icon: typeof CheckCircle2; border: string; iconColor: string; bar: string }> = {
  success: { Icon: CheckCircle2, border: "border-green/30", iconColor: "text-green", bar: "bg-green" },
  error:   { Icon: XCircle,      border: "border-red/30",   iconColor: "text-red",   bar: "bg-red" },
  info:    { Icon: Info,         border: "border-blue/30",  iconColor: "text-blue",  bar: "bg-blue" },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { Icon, border, iconColor, bar } = STYLES[item.type];
  return (
    <div
      className={`toast-in glass rounded-xl border ${border} shadow-xl overflow-hidden pointer-events-auto w-full max-w-sm`}
      role="status"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} />
        <p className="text-sm flex-1" style={{ color: "var(--text)" }}>{item.message}</p>
        <button onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
          <X size={15} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
      <div className="h-0.5 w-full bg-black/10">
        <div className={`h-full ${bar} toast-progress`} style={{ animationDuration: `${item.duration}ms` }} />
      </div>
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type, duration }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 items-end px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
