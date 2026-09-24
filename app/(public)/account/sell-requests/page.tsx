import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { SectionHeading, EmptyState, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { SELL_REQUEST_STATUSES } from "@/lib/constants";
import { formatNad } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "My Sell Requests" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger" | "yellow"> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "warning",
  CONTACTED: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  CONVERTED: "yellow",
};

export default async function AccountSellRequestsPage() {
  const user = await requireUser();
  const sellRequests = await prisma.sellRequest.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } } },
  });

  return (
    <div>
      <SectionHeading title="My Sell Requests" description="Track the status of items you've submitted to ESell." />

      <div className="mt-8">
        {sellRequests.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={32} />}
            title="No Sell Requests yet"
            description="Submit an item and ESell's team will review it."
            action={
              <Link href="/sell" className="text-sm font-bold text-brand-yellow-hover hover:underline">
                Sell Your Goods
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {sellRequests.map((req) => (
              <Card key={req.id} className="flex items-center gap-4 p-4">
                {req.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={req.photos[0].url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-off-white" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-black">{req.productName}</p>
                  <p className="text-xs text-secondary-text">
                    {req.expectedPrice ? formatNad(req.expectedPrice.toString()) : "No price given"} ·{" "}
                    {req.location}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[req.status]}>
                  {SELL_REQUEST_STATUSES.find((s) => s.value === req.status)?.label ?? req.status}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
