"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

export function AccountMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg p-2 text-brand-black hover:bg-off-white"
      >
        <User size={18} />
        <span className="hidden text-sm font-semibold lg:inline">{name.split(" ")[0]}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
        >
          <Link href="/account" role="menuitem" className="block px-4 py-2 text-sm hover:bg-off-white">
            My Account
          </Link>
          <Link
            href="/account/sell-requests"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-off-white"
          >
            My Sell Requests
          </Link>
          <Link href="/account/favorites" role="menuitem" className="block px-4 py-2 text-sm hover:bg-off-white">
            Favorites
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-off-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
