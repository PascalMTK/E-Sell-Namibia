import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ClipboardList } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const user = await requireUser();

  const [sellRequestCount, favoriteCount] = await Promise.all([
    prisma.sellRequest.count({ where: { customerId: user.id } }),
    prisma.favorite.count({ where: { userId: user.id } }),
  ]);

  return (
    <div>
      <SectionHeading title={`Welcome back, ${user.name?.split(" ")[0] ?? ""}`} description={user.email ?? ""} />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/account/sell-requests">
          <Card className="flex items-center gap-4 p-6 transition hover:border-brand-yellow-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow-hover">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">{sellRequestCount}</p>
              <p className="text-xs font-semibold text-secondary-text">Sell Requests</p>
            </div>
          </Card>
        </Link>
        <Link href="/account/favorites">
          <Card className="flex items-center gap-4 p-6 transition hover:border-brand-yellow-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow-hover">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-black">{favoriteCount}</p>
              <p className="text-xs font-semibold text-secondary-text">Favorites</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
