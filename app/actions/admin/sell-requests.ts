"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { sellRequestStatusUpdateSchema } from "@/lib/validation/admin";

export interface SellRequestUpdateState {
  success?: boolean;
  error?: string;
}

export async function updateSellRequestStatusAction(input: unknown): Promise<SellRequestUpdateState> {
  const admin = await requireAdmin();
  const parsed = sellRequestStatusUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid status update." };

  const { id, status, note } = parsed.data;

  await prisma.$transaction([
    prisma.sellRequest.update({ where: { id }, data: { status, adminNotes: note || undefined } }),
    prisma.statusHistoryEntry.create({ data: { sellRequestId: id, status, note: note || null } }),
    prisma.adminActivity.create({
      data: {
        adminId: admin.id,
        type: "SELL_REQUEST_STATUS_CHANGED",
        description: `Sell request status changed to ${status}`,
        targetId: id,
      },
    }),
  ]);

  revalidatePath("/admin/sell-requests");
  revalidatePath(`/admin/sell-requests/${id}`);
  return { success: true };
}
