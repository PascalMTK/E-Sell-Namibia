"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tags,
  Image as ImageIcon,
  Users,
  UserSquare2,
  Settings,
  LogOut,
  ShoppingCart,
  Megaphone,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";

export interface AdminBadges {
  sellRequests: number;
  orders: number;
}

const NAV_GROUPS: {
  label?: string;
  items: { href: string; label: string; icon: typeof Package; badge?: keyof AdminBadges }[];
}[] = [
  { items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "orders" },
      { href: "/admin/sell-requests", label: "Sell Requests", icon: ClipboardList, badge: "sellRequests" },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/team", label: "Team", icon: UserSquare2 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ adminName, badges, onNavigate }: { adminName: string; badges: AdminBadges; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-10 items-center rounded-lg bg-white px-2">
          <Image src="/logo.png" alt="ESell" width={474} height={193} className="h-6 w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-extrabold text-white">Namibia</span>
          <span className="block text-xs text-gray-400">Admin dashboard</span>
        </span>
      </Link>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={group.label ?? i} className={cn(i > 0 && "mt-5")}>
            {group.label && <p className="mb-1.5 px-3 text-xs font-semibold text-gray-500">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badge ? badges[item.badge] : 0;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-yellow" />}
                    <Icon size={17} className={cn(active ? "text-brand-yellow" : "text-gray-500 group-hover:text-gray-300")} />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="min-w-5 rounded-full bg-brand-yellow px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-brand-black">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-brand-border p-3">
        <Link
          href="/"
          target="_blank"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={16} className="text-gray-500" /> View store
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-black">
            {adminName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{adminName}</span>
            <span className="block text-xs text-gray-500">Administrator</span>
          </span>
          <form action={adminSignOutAction}>
            <button
              type="submit"
              title="Log out"
              aria-label="Log out"
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ adminName, badges }: { adminName: string; badges: AdminBadges }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV_GROUPS.flatMap((g) => g.items).find((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-brand-charcoal lg:block">
        <SidebarContent adminName={adminName} badges={badges} />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-brand-border bg-brand-charcoal px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="-ml-1 rounded-lg p-2 hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
        <span className="flex-1 truncate text-sm font-semibold">{current?.label ?? "Admin"}</span>
        {badges.orders + badges.sellRequests > 0 && (
          <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold text-brand-black">
            {badges.orders + badges.sellRequests} to review
          </span>
        )}
      </div>

      <div className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")} inert={!open}>
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-black/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-brand-charcoal shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="absolute right-3 top-5 rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
          <SidebarContent adminName={adminName} badges={badges} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
