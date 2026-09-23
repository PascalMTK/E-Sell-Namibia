"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { checkoutFormSchema } from "@/lib/validation/checkout";
import { getUserCartItems } from "@/lib/data/cart";
import { applyProductStockDecrement } from "@/lib/data/orders";
import { uniqueOrderNumber } from "@/lib/utils/order-number";
import { createDpoToken, verifyDpoToken, buildDpoPaymentUrl } from "@/lib/payments/dpo";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export interface PlaceOrderState {
  error?: string;
  success?: boolean;
  orderId?: string;
  redirectUrl?: string;
}

export async function placeOrderAction(input: unknown): Promise<PlaceOrderState> {
  const session = await auth();
  if (!session?.user) return { error: "Please log in to check out." };

  const parsed = checkoutFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid checkout details." };

  const cartItems = await getUserCartItems(session.user.id);
  if (cartItems.length === 0) return { error: "Your cart is empty." };

  for (const item of cartItems) {
    if (!item.product.published || item.product.sold || item.product.quantity < item.quantity) {
      return { error: `"${item.product.name}" is no longer available in the quantity requested.` };
    }
  }

  const orderItemsData = cartItems.map((item) => {
    const lineTotal = item.product.price.times(item.quantity);
    return {
      productId: item.productId,
      productNameSnapshot: item.product.name,
      productPriceSnapshot: item.product.price,
      productImageSnapshot: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
      lineTotal,
    };
  });
  const subtotal = orderItemsData.reduce((sum, item) => sum.plus(item.lineTotal), new Prisma.Decimal(0));

  const orderNumber = await uniqueOrderNumber();
  const { paymentMethod, deliveryMethod, deliveryAddress, notes } = parsed.data;

  if (paymentMethod === "CASH_EFT") {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING_PAYMENT",
          paymentMethod,
          customerId: session.user.id,
          customerName: session.user.name || "",
          customerEmail: session.user.email || "",
          customerPhone: "",
          deliveryMethod: deliveryMethod || null,
          deliveryAddress: deliveryAddress || null,
          notes: notes || null,
          subtotal,
          total: subtotal,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
      await tx.orderStatusHistoryEntry.create({
        data: { orderId: created.id, status: "PENDING_PAYMENT", note: "Order placed — Cash/EFT" },
      });
      await applyProductStockDecrement(
        tx,
        cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      await tx.cartItem.deleteMany({ where: { id: { in: cartItems.map((item) => item.id) } } });
      await tx.adminActivity.create({
        data: { type: "ORDER_STATUS_CHANGED", description: `Order ${orderNumber} placed (Cash/EFT)`, targetId: created.id },
      });
      return created;
    });

    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
    }).catch(console.error);

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id, redirectUrl: `/account/orders/${order.id}?placed=1` };
  }

  // CARD_DPO — no stock/cart mutation yet; only on confirmed payment.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        status: "PENDING_PAYMENT",
        paymentMethod,
        customerId: session.user.id,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: "",
        deliveryMethod: deliveryMethod || null,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        subtotal,
        total: subtotal,
        items: { create: orderItemsData },
      },
    });
    await tx.orderStatusHistoryEntry.create({
      data: { orderId: created.id, status: "PENDING_PAYMENT", note: "Awaiting card payment" },
    });
    return created;
  });

  const [firstName, ...rest] = (order.customerName || "Customer").split(" ");
  const dpoResult = await createDpoToken({
    order: { id: order.id, orderNumber: order.orderNumber, total: order.total.toString() },
    customer: { firstName, lastName: rest.join(" ") || "-", email: order.customerEmail },
    redirectUrl: `${siteUrl}/checkout/dpo-return?order=${order.id}`,
    backUrl: `${siteUrl}/cart?cancelled=1`,
  });

  if (!dpoResult.success) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
      prisma.orderStatusHistoryEntry.create({ data: { orderId: order.id, status: "FAILED", note: dpoResult.error } }),
    ]);
    return { error: dpoResult.error };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { dpoTransToken: dpoResult.transToken, dpoTransRef: dpoResult.transRef },
  });

  return { success: true, orderId: order.id, redirectUrl: buildDpoPaymentUrl(dpoResult.transToken) };
}

export interface DpoReturnState {
  success?: boolean;
  status?: string;
  error?: string;
}

export async function confirmDpoReturnAction(orderId: string): Promise<DpoReturnState> {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: session.user.id },
    include: { items: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.status === "PAID" || order.status === "PROCESSING" || order.status === "COMPLETED") {
    return { success: true, status: order.status };
  }
  if (!order.dpoTransToken) return { error: "This order has no card payment session." };

  const verifyResult = await verifyDpoToken(order.dpoTransToken);
  if (!verifyResult.success) return { error: verifyResult.error };

  if (verifyResult.paid) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date(), dpoResultCode: verifyResult.resultCode },
      });
      await tx.orderStatusHistoryEntry.create({
        data: { orderId: order.id, status: "PAID", note: "Card payment confirmed via DPO" },
      });
      await applyProductStockDecrement(
        tx,
        order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      await tx.cartItem.deleteMany({ where: { userId: session.user.id, productId: { in: order.items.map((i) => i.productId) } } });
      await tx.adminActivity.create({
        data: { type: "ORDER_STATUS_CHANGED", description: `Order ${order.orderNumber} paid via DPO`, targetId: order.id },
      });
    });

    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items,
    }).catch(console.error);

    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
    return { success: true, status: "PAID" };
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "FAILED", dpoResultCode: verifyResult.resultCode } }),
    prisma.orderStatusHistoryEntry.create({
      data: { orderId: order.id, status: "FAILED", note: `DPO result ${verifyResult.resultCode}` },
    }),
  ]);
  return { success: false, status: "FAILED", error: "Payment was not completed." };
}
