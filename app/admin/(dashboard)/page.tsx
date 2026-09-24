import type { Metadata } from "next";
import Link from "next/link";
import { Box, CheckCircle2, PackageX, Users, ClipboardList, DollarSign, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { formatNad } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalProducts,
    publishedProducts,
    soldProducts,
    newSellRequests,
    customers,
    outOfStock,
    soldValueAgg,
    pendingOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { sold: true } }),
    prisma.sellRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count({ where: { stockStatus: "OUT_OF_STOCK" } }),
    prisma.product.aggregate({ where: { sold: true }, _sum: { price: true } }),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
  ]);

  const cards = [
    { label: "Total Products", value: totalProducts, icon: Box },
    { label: "Published Products", value: publishedProducts, icon: CheckCircle2 },
    { label: "Products Sold", value: soldProducts, icon: DollarSign },
    { label: "New Sell Requests", value: newSellRequests, icon: ClipboardList, href: "/admin/sell-requests" },
    { label: "Pending Orders", value: pendingOrders, icon: ShoppingCart, href: "/admin/orders?status=PENDING_PAYMENT" },
    { label: "Customers", value: customers, icon: Users, href: "/admin/customers" },
    { label: "Out of Stock", value: outOfStock, icon: PackageX },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-brand-black">Admin Overview</h1>
        <p className="text-sm text-secondary-text">Manage listings, sell requests and platform activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <Card className="flex items-center gap-4 p-6 transition hover:border-brand-yellow-hover">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-yellow/15 text-brand-yellow-hover">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-black">{card.value}</p>
                <p className="text-xs font-semibold text-secondary-text">{card.label}</p>
              </div>
            </Card>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}

        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-yellow/15 text-brand-yellow-hover">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-black">
              {formatNad(soldValueAgg._sum.price?.toString() ?? "0")}
            </p>
            <p className="text-xs font-semibold text-secondary-text">Sales Volume (sold items)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
