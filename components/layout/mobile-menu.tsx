"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "My Cart" },
  { href: "/announcements", label: "Announcements" },
  { href: "/sell", label: "Sell Your Goods" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-brand-black hover:bg-off-white"
      >
        <span className="relative block h-5.5 w-5.5">
          <Menu
            size={22}
            className={cn(
              "absolute inset-0 transition duration-200",
              open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
            )}
          />
          <X
            size={22}
            className={cn(
              "absolute inset-0 transition duration-200",
              open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
            )}
          />
        </span>
      </button>

      <div
        id={menuId}
        ref={panelRef}
        inert={!open}
        className={cn(
          "mobile-nav-panel absolute inset-x-0 top-full z-40 border-b border-gray-200 bg-white px-4 shadow-lg",
          open && "is-open",
        )}
      >
        <div>
          <nav aria-label="Mobile navigation" className="flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-brand-black transition hover:translate-x-1 hover:bg-off-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-brand-black transition hover:translate-x-1 hover:bg-off-white"
            >
              {isAuthenticated ? "My Account" : "Login / Register"}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
