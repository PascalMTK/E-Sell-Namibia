"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/announcements", label: "Announcements" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop category/navigation bar under the main header row. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex h-full items-center gap-1">
      {NAV_LINKS.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center whitespace-nowrap px-2.5 text-sm xl:px-3 font-semibold transition-colors",
              "after:absolute after:inset-x-2.5 after:bottom-0 xl:after:inset-x-3 after:h-0.5 after:origin-left after:rounded-full after:bg-brand-yellow after:transition-transform after:duration-300",
              active
                ? "text-brand-black after:scale-x-100"
                : "text-brand-black/65 after:scale-x-0 hover:text-brand-black hover:after:scale-x-100",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
