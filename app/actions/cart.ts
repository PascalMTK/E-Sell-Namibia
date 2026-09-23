"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export interface CartActionState {
  requiresLogin?: boolean;
  success?: boolean;
  error?: string;
}

export async function addToCartAction(productId: string): Promise<CartActionState> {
  const session = await auth();
  if (!session?.user) return { requiresLogin: true };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.published || product.sold || product.stockStatus === "OUT_OF_STOCK") {
    return { error: "This product is not available right now." };
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  const nextQuantity = Math.min((existing?.quantity ?? 0) + 1, product.quantity);
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQuantity } });
  } else {
    await prisma.cartItem.create({ data: { userId: session.user.id, productId, quantity: nextQuantity } });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantityAction(cartItemId: string, quantity: number): Promise<CartActionState> {
  const session = await auth();
  if (!session?.user) return { requiresLogin: true };

  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { product: true } });
  if (!item || item.userId !== session.user.id) return { error: "Cart item not found." };

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    const clamped = Math.min(quantity, item.product.quantity);
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: clamped } });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCartAction(cartItemId: string): Promise<CartActionState> {
  const session = await auth();
  if (!session?.user) return { requiresLogin: true };

  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== session.user.id) return { error: "Cart item not found." };

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
  return { success: true };
}
