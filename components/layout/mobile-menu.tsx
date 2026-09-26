"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, ShoppingCart, Tag, User, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS, isActivePath } from "@/components/layout/nav-links";

const QUICK_LINKS = [
  { href: "/cart", label: "My Cart", icon: ShoppingCart },
  { href: "/account/favorites", label: "Favorites", icon: Heart },
];

export function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();

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

  const close = () => setOpen(false);
  const accountHref = isAuthenticated ? "/account" : "/login";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-brand-black hover:bg-off-white"
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
          "mobile-nav-panel absolute inset-x-0 top-full z-40 border-b border-gray-200 bg-white shadow-lg",
          open && "is-open",
        )}
      >
        <div>
          <div className="max-h-[calc(100svh-4rem)] overflow-y-auto px-4 pb-5 pt-3 sm:px-6">
            <nav aria-label="Mobile navigation" className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg border-l-[3px] px-3 py-3 text-sm font-semibold transition hover:bg-off-white",
                      active ? "border-brand-yellow bg-[#fff9e8] text-brand-black" : "border-transparent text-brand-black/80",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
              {[...QUICK_LINKS, { href: accountHref, label: isAuthenticated ? "Account" : "Login", icon: User }].map(
                ({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-brand-black transition hover:border-brand-yellow hover:bg-[#fff9e8]"
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ),
              )}
            </div>

            <Link
              href="/sell"
              onClick={close}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-3 text-sm font-bold text-brand-black transition hover:bg-brand-yellow-hover"
            >
              <Tag size={16} />
              Sell Your Goods
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
