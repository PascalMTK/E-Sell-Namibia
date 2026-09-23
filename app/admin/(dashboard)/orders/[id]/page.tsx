import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrderStatusPanel } from "@/components/admin/order-status-panel";
import { getAdminOrderById } from "@/lib/data/orders";
import { formatNad } from "@/lib/utils/currency";
import { PAYMENT_METHODS, ORDER_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin · Order" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black">Order {order.orderNumber}</h1>
          <p className="text-sm text-secondary-text">Placed {order.createdAt.toLocaleString("en-NA")}</p>
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

        {(order.deliveryMethod || order.deliveryAddress || order.notes) && (
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold text-brand-black">Delivery &amp; Notes</h2>
            <dl className="space-y-3 text-sm">
              {order.deliveryMethod && (
                <div>
                  <dt className="text-xs text-secondary-text">Delivery Method</dt>
                  <dd className="flex items-center gap-1 font-semibold text-brand-black">
                    <Truck size={13} /> {order.deliveryMethod}
                  </dd>
                </div>
              )}
              {order.deliveryAddress && (
                <div>
                  <dt className="text-xs text-secondary-text">Address</dt>
                  <dd className="flex items-center gap-1 font-semibold text-brand-black">
                    <MapPin size={13} /> {order.deliveryAddress}
                  </dd>
                </div>
              )}
              {order.notes && (
                <div>
                  <dt className="text-xs text-secondary-text">Customer Notes</dt>
                  <dd className="whitespace-pre-line text-brand-black">{order.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-bold text-brand-black">Status History</h2>
          <ul className="space-y-2 text-xs text-secondary-text">
            {order.statusHistory.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                <span className="font-semibold text-brand-black">
                  {ORDER_STATUSES.find((s) => s.value === entry.status)?.label ?? entry.status}
                  {entry.note ? ` — ${entry.note}` : ""}
                </span>
                <span>{entry.createdAt.toLocaleString("en-NA")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Customer</h2>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-brand-black">{order.customerName}</p>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-secondary-text hover:text-brand-black">
                <Phone size={14} /> {order.customerPhone}
              </a>
            )}
            <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 text-secondary-text hover:text-brand-black">
              <Mail size={14} /> {order.customerEmail}
            </a>
            <p className="pt-2 text-xs font-semibold text-secondary-text">
              Payment: {PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Update Status</h2>
          <OrderStatusPanel id={order.id} currentStatus={order.status} currentNotes={order.adminNotes} />
        </Card>
      </div>
    </div>
  );
}
