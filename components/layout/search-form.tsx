"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className={className}
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        placeholder="Search products…"
        className="w-40 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-brand-yellow-hover sm:w-56"
      />
    </form>
  );
}
