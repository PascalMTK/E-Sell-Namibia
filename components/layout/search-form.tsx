"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function HeaderSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Search products"
        aria-expanded={open}
        className={className}
      >
        <Search size={18} />
      </button>
      {open && (
        <form
          onSubmit={submit}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          className="absolute top-[calc(100%+0.5rem)] right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl sm:right-6 lg:right-8"
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-yellow-hover"
          />
          <button type="submit" aria-label="Submit search" className="rounded-lg bg-brand-yellow p-2 text-brand-black hover:bg-brand-yellow-hover"><Search size={18} /></button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="rounded-lg p-2 text-brand-black hover:bg-off-white"><X size={18} /></button>
        </form>
      )}
    </>
  );
}
