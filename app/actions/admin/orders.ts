"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { orderStatusUpdateSchema } from "@/lib/validation/admin";
import { restockOrderItems } from "@/lib/data/orders";

export interface OrderUpdateState {
  success?: boolean;
  error?: string;
}

const STOCK_DECREMENTED_STATUSES = new Set(["PAID", "PROCESSING", "COMPLETED"]);

export async function updateOrderStatusAction(input: unknown): Promise<OrderUpdateState> {
  const admin = await requireAdmin();
  const parsed = orderStatusUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid status update." };

  const { id, status, note } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Order not found." };

  const needsRestock =
    status === "CANCELLED" &&
    order.status !== "CANCELLED" &&
    (order.paymentMethod === "CASH_EFT" || STOCK_DECREMENTED_STATUSES.has(order.status));

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status, adminNotes: note || undefined } });
    await tx.orderStatusHistoryEntry.create({ data: { orderId: id, status, note: note || null } });
    if (needsRestock) {
      await restockOrderItems(
        tx,
        order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
    }
    await tx.adminActivity.create({
      data: {
        adminId: admin.id,
        type: "ORDER_STATUS_CHANGED",
        description: `Order ${order.orderNumber} status changed to ${status}`,
        targetId: id,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/account/orders/${id}`);
  return { success: true };
}
