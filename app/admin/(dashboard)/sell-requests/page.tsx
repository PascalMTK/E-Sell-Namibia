import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList } from "lucide-react";
import { Prisma, SellRequestStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { SELL_REQUEST_STATUSES } from "@/lib/constants";
import { formatNad } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "Admin · Sell Requests" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger" | "yellow"> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "warning",
  CONTACTED: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  CONVERTED: "yellow",
};

export default async function AdminSellRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where: Prisma.SellRequestWhereInput = status ? { status: status as SellRequestStatus } : {};

  const sellRequests = await prisma.sellRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } }, category: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Sell Requests</h1>
        <p className="text-sm text-secondary-text">Review items customers have submitted for E-Sell to sell.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/sell-requests"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${!status ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white"}`}
        >
          All
        </Link>
        {SELL_REQUEST_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/sell-requests?status=${s.value}`}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${status === s.value ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {sellRequests.length === 0 ? (
        <EmptyState icon={<ClipboardList size={32} />} title="No Sell Requests yet" description="Customer submissions will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-off-white text-xs uppercase tracking-wide text-secondary-text">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Expected Price</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Location</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellRequests.map((req) => (
                <tr key={req.id} className="hover:bg-off-white/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-off-white">
                        {req.photos[0] && (
                          <Image src={req.photos[0].url} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="line-clamp-1 font-semibold text-brand-black">{req.productName}</p>
                        <p className="text-xs text-secondary-text">{req.category?.name ?? "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-secondary-text">
                    <p className="font-semibold text-brand-black">{req.customerName}</p>
                    <p className="text-xs">{req.phone}</p>
                  </td>
                  <td className="p-3 font-bold text-brand-black">
                    {req.expectedPrice ? formatNad(req.expectedPrice.toString()) : "—"}
                  </td>
                  <td className="p-3 text-secondary-text">{req.condition.replace("_", " ")}</td>
                  <td className="p-3 text-secondary-text">{req.location}</td>
                  <td className="p-3 text-secondary-text">{req.createdAt.toLocaleDateString("en-NA")}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[req.status]}>
                      {SELL_REQUEST_STATUSES.find((s) => s.value === req.status)?.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/sell-requests/${req.id}`} className="text-xs font-bold text-amber-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
