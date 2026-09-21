import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Unsubscribe" };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const user = token ? await prisma.user.findUnique({ where: { unsubscribeToken: token } }) : null;

  if (!user) {
    return (
      <AuthCard title="Invalid link">
        <div className="flex flex-col items-center gap-3 text-center">
          <XCircle className="text-red-500" size={28} />
          <p className="text-sm text-secondary-text">
            This unsubscribe link is invalid or has already been used.
          </p>
        </div>
      </AuthCard>
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { receiveProductAlerts: false } });

  return (
    <AuthCard title="You're unsubscribed">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="text-amber-600" size={28} />
        <p className="text-sm text-secondary-text">
          {user.email} will no longer receive new product alert emails from ESell Namibia. You can turn these
          back on any time from your account profile.
        </p>
      </div>
    </AuthCard>
  );
}
