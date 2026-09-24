import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/card";
import { getAdminOrders } from "@/lib/data/orders";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import { formatNad } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "Admin · Orders" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger" | "yellow"> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "yellow",
  COMPLETED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as OrderStatus | undefined;
  const { items: orders, page, pageCount } = await getAdminOrders({
    status,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Orders</h1>
        <p className="text-sm text-secondary-text">Review and manage customer orders and payments.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${!status ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white"}`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/orders?status=${s.value}`}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${status === s.value ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={32} />} title="No orders yet" description="Customer orders will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-off-white text-xs uppercase tracking-wide text-secondary-text">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Placed</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-off-white/60">
                  <td className="p-3 font-semibold text-brand-black">{order.orderNumber}</td>
                  <td className="p-3 text-secondary-text">
                    <p className="font-semibold text-brand-black">{order.customerName}</p>
                    <p className="text-xs">{order.customerEmail}</p>
                  </td>
                  <td className="p-3 font-bold text-brand-black">{formatNad(order.total.toString())}</td>
                  <td className="p-3 text-secondary-text">
                    {PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label}
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[order.status]}>
                      {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-secondary-text">{order.createdAt.toLocaleDateString("en-NA")}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold text-brand-yellow-hover hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: pageCount }).map((_, i) => {
            const p = i + 1;
            const params = new URLSearchParams();
            if (status) params.set("status", status);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/admin/orders?${params}`}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${p === page ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white"}`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
