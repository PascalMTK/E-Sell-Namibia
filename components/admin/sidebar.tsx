"use client";

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
} from "lucide-react";
import { adminSignOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/sell-requests", label: "Sell Requests", icon: ClipboardList },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/team", label: "Team", icon: UserSquare2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-brand-border bg-brand-charcoal text-white">
      <div className="flex items-center gap-2.5 border-b border-brand-border px-5 py-5">
        <span className="flex h-9 items-center rounded-lg bg-white px-2 py-1">
          <Image src="/logo.png" alt="E-Sell" width={474} height={193} className="h-5 w-auto" />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide">Namibia</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                active ? "bg-brand-yellow text-brand-black" : "text-gray-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-border p-4">
        <p className="mb-2 truncate text-xs text-gray-400">{adminName}</p>
        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
