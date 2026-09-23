import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/card";
import { DpoReturnStatus } from "@/components/checkout/dpo-return-status";
import { requireUser } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Confirming Payment" };
export const dynamic = "force-dynamic";

export default async function DpoReturnPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  await requireUser();
  const { order } = await searchParams;
  if (!order) redirect("/cart");

  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-16">
      <DpoReturnStatus orderId={order} />
    </Container>
  );
}
