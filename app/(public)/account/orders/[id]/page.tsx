import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/permissions";
import { getUserOrderById } from "@/lib/data/orders";
import { formatNad } from "@/lib/utils/currency";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";

export const metadata: Metadata = { title: "Order Details" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger" | "yellow"> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "yellow",
  COMPLETED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { placed } = await searchParams;
  const order = await getUserOrderById(user.id, id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      {placed && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          <CheckCircle2 size={16} /> Your order has been placed.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-black">Order {order.orderNumber}</h1>
          <p className="text-sm text-secondary-text">Placed {order.createdAt.toLocaleString("en-NA")}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{ORDER_STATUSES.find((s) => s.value === order.status)?.label}</Badge>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-bold text-brand-black">Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-brand-black">{item.productNameSnapshot}</p>
                <p className="text-xs text-secondary-text">
                  {formatNad(item.productPriceSnapshot.toString())} &times; {item.quantity}
                </p>
              </div>
              <p className="font-bold text-brand-black">{formatNad(item.lineTotal.toString())}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm font-bold text-brand-black">Total</p>
          <p className="text-lg font-extrabold text-brand-black">{formatNad(order.total.toString())}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-bold text-brand-black">Payment &amp; Delivery</h2>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-secondary-text">Payment Method</dt>
            <dd className="font-semibold text-brand-black">
              {PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label}
            </dd>
          </div>
          {order.deliveryMethod && (
            <div>
              <dt className="text-xs text-secondary-text">Delivery Method</dt>
              <dd className="font-semibold text-brand-black">{order.deliveryMethod}</dd>
            </div>
          )}
          {order.deliveryAddress && (
            <div>
              <dt className="text-xs text-secondary-text">Address</dt>
              <dd className="font-semibold text-brand-black">{order.deliveryAddress}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-bold text-brand-black">Status History</h2>
        <ul className="space-y-2 text-xs text-secondary-text">
          {order.statusHistory.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
              <span className="font-semibold text-brand-black">
                {ORDER_STATUSES.find((s) => s.value === entry.status)?.label ?? entry.status}
              </span>
              <span>{entry.createdAt.toLocaleString("en-NA")}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
