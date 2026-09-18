"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function toggleFavoriteAction(productId: string): Promise<{ requiresLogin?: boolean; favorited?: boolean }> {
  const session = await auth();
  if (!session?.user) return { requiresLogin: true };

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/account/favorites");
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId: session.user.id, productId } });
  revalidatePath("/account/favorites");
  return { favorited: true };
}

export async function getUserFavoriteIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const favorites = await prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
  return new Set(favorites.map((f) => f.productId));
}
