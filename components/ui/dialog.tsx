"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[min(92vw,640px)] rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl backdrop:bg-black/70",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 id="dialog-title" className="text-lg font-extrabold text-brand-black">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-black"
        >
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
    </dialog>
  );
}
