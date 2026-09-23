import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { SectionHeading, EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/permissions";
import { getUserOrders } from "@/lib/data/orders";
import { formatNad } from "@/lib/utils/currency";
import { ORDER_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "My Orders" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger" | "yellow"> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "yellow",
  COMPLETED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await getUserOrders(user.id);

  return (
    <div>
      <SectionHeading title="My Orders" description="Track your orders and payment status." />
      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={36} />}
            title="No orders yet"
            description="Products you order will show up here."
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-yellow-hover"
              >
                <div>
                  <p className="text-sm font-bold text-brand-black">{order.orderNumber}</p>
                  <p className="text-xs text-secondary-text">{order.createdAt.toLocaleDateString("en-NA")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-brand-black">{formatNad(order.total.toString())}</p>
                  <Badge variant={STATUS_VARIANT[order.status]}>
                    {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
