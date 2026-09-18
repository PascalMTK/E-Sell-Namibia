"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  title: string;
  message?: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-2xl"
          >
            <div
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                toast.kind === "success" && "bg-brand-yellow text-brand-black",
                toast.kind === "error" && "bg-red-100 text-red-600",
                toast.kind === "info" && "bg-gray-100 text-gray-600",
              )}
            >
              {toast.kind === "error" ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-black">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs text-secondary-text">{toast.message}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-gray-400 hover:text-brand-black"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
