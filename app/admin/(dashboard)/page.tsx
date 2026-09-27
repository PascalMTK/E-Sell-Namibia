import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  ClipboardList,
  CreditCard,
  ExternalLink,
  PackageX,
  Plus,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { ORDER_STATUSES, SELL_REQUEST_STATUSES } from "@/lib/constants";
import { formatNad } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

type BadgeVariant = "neutral" | "warning" | "success" | "danger" | "yellow";

const ORDER_VARIANT: Record<string, BadgeVariant> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "yellow",
  COMPLETED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

const SELL_REQUEST_VARIANT: Record<string, BadgeVariant> = {
  SUBMITTED: "yellow",
  UNDER_REVIEW: "warning",
  CONTACTED: "neutral",
  ACCEPTED: "success",
  REJECTED: "danger",
  CONVERTED: "success",
};

const label = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((s) => s.value === value)?.label ?? value;

const shortDate = new Intl.DateTimeFormat("en-NA", { day: "numeric", month: "short" });

function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days} d ago` : shortDate.format(date);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-NA", { hour: "numeric", hour12: false, timeZone: "Africa/Windhoek" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const monthAgo = daysAgo(30);

  const [
    totalProducts,
    publishedProducts,
    outOfStock,
    lowStock,
    customers,
    newCustomers,
    totalOrders,
    pendingPayment,
    toFulfil,
    revenueAgg,
    monthRevenueAgg,
    newSellRequests,
    recentOrders,
    recentSellRequests,
    recentActivity,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { stockStatus: "OUT_OF_STOCK" } }),
    prisma.product.count({ where: { stockStatus: "LOW_STOCK" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: monthAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.order.aggregate({ where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] }, createdAt: { gte: monthAgo } },
      _sum: { total: true },
    }),
    prisma.sellRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.sellRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, productName: true, customerName: true, location: true, status: true, createdAt: true },
    }),
    prisma.adminActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, description: true, createdAt: true },
    }),
  ]);

  const stats = [
    {
      label: "Revenue",
      value: formatNad(revenueAgg._sum.total?.toString() ?? "0"),
      hint: `${formatNad(monthRevenueAgg._sum.total?.toString() ?? "0")} in the last 30 days`,
      icon: TrendingUp,
      href: "/admin/orders",
    },
    {
      label: "Orders",
      value: totalOrders,
      hint: toFulfil > 0 ? `${toFulfil} to prepare` : "Nothing to prepare",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Live products",
      value: publishedProducts,
      hint: `${totalProducts - publishedProducts} draft${totalProducts - publishedProducts === 1 ? "" : "s"} · ${totalProducts} total`,
      icon: Box,
      href: "/admin/products",
    },
    {
      label: "Customers",
      value: customers,
      hint: `+${newCustomers} in the last 30 days`,
      icon: Users,
      href: "/admin/customers",
    },
  ];

  const attention = [
    { label: "New sell requests", count: newSellRequests, icon: ClipboardList, href: "/admin/sell-requests?status=SUBMITTED" },
    { label: "Awaiting payment", count: pendingPayment, icon: CreditCard, href: "/admin/orders?status=PENDING_PAYMENT" },
    { label: "Low stock", count: lowStock, icon: TriangleAlert, href: "/admin/products" },
    { label: "Out of stock", count: outOfStock, icon: PackageX, href: "/admin/products" },
  ];

  const firstName = (admin.name ?? "Admin").split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-secondary-text">
            {new Intl.DateTimeFormat("en-NA", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Windhoek" }).format(new Date())}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand-black sm:text-3xl">
            {greeting()}, {firstName}
          </h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/" target="_blank" variant="secondary">
            <ExternalLink size={16} /> View store
          </ButtonLink>
          <ButtonLink href="/admin/products/new">
            <Plus size={16} /> Add product
          </ButtonLink>
        </div>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card
                className={cn(
                  "h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md",
                  i === 0 && "border-brand-charcoal bg-brand-charcoal text-white",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("text-sm font-medium", i === 0 ? "text-gray-300" : "text-secondary-text")}>{stat.label}</p>
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      i === 0 ? "bg-brand-yellow text-brand-black" : "bg-[#fff4d6] text-brand-yellow-hover",
                    )}
                  >
                    <Icon size={18} />
                  </span>
                </div>
                <p className={cn("mt-3 text-3xl font-extrabold tracking-tight", i === 0 ? "text-white" : "text-brand-black")}>
                  {stat.value}
                </p>
                <p className={cn("mt-1 text-xs", i === 0 ? "text-gray-400" : "text-secondary-text")}>{stat.hint}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Needs attention */}
      <Card className="p-5">
        <h2 className="text-base font-bold text-brand-black">Needs your attention</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {attention.map((item) => {
            const Icon = item.icon;
            const active = item.count > 0;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition hover:border-brand-yellow",
                  active ? "border-[#eadcae] bg-[#fffaeb]" : "border-gray-200 bg-white",
                )}
              >
                <Icon size={18} className={active ? "text-brand-yellow-hover" : "text-gray-400"} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-xl font-extrabold leading-none", active ? "text-brand-black" : "text-gray-400")}>
                    {item.count}
                  </span>
                  <span className="mt-1 block truncate text-xs text-secondary-text">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent orders */}
        <Card className="overflow-hidden xl:col-span-2">
          <PanelHeader title="Recent orders" href="/admin/orders" />
          {recentOrders.length === 0 ? (
            <EmptyPanel text="No orders yet. They will appear here as soon as customers check out." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-y border-gray-100 bg-gray-50/70 text-left text-xs text-secondary-text">
                    <th className="px-5 py-2.5 font-medium">Order</th>
                    <th className="px-5 py-2.5 font-medium">Customer</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-semibold text-brand-black hover:underline">
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-secondary-text">{timeAgo(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-brand-black">{order.customerName}</td>
                      <td className="px-5 py-3">
                        <Badge variant={ORDER_VARIANT[order.status] ?? "neutral"}>{label(ORDER_STATUSES, order.status)}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-brand-black">{formatNad(order.total.toString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Latest sell requests */}
        <Card className="overflow-hidden">
          <PanelHeader title="Latest sell requests" href="/admin/sell-requests" />
          {recentSellRequests.length === 0 ? (
            <EmptyPanel text="No sell requests yet." />
          ) : (
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {recentSellRequests.map((request) => (
                <li key={request.id}>
                  <Link href={`/admin/sell-requests/${request.id}`} className="flex items-start gap-3 px-5 py-3 transition hover:bg-gray-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-brand-black">{request.productName}</span>
                      <span className="block truncate text-xs text-secondary-text">
                        {request.customerName} · {request.location} · {timeAgo(request.createdAt)}
                      </span>
                    </span>
                    <Badge variant={SELL_REQUEST_VARIANT[request.status] ?? "neutral"} className="shrink-0">
                      {label(SELL_REQUEST_STATUSES, request.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Activity */}
      <Card className="overflow-hidden">
        <PanelHeader title="Recent activity" />
        {recentActivity.length === 0 ? (
          <EmptyPanel text="Admin actions (new products, status changes…) will be listed here." />
        ) : (
          <ul className="border-t border-gray-100 px-5 py-2">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-yellow" />
                <span className="min-w-0 flex-1 truncate text-brand-black">{entry.description}</span>
                <span className="shrink-0 text-xs text-secondary-text">{timeAgo(entry.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PanelHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <h2 className="text-base font-bold text-brand-black">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-brand-yellow-hover hover:underline">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <p className="border-t border-gray-100 px-5 py-10 text-center text-sm text-secondary-text">{text}</p>;
}
