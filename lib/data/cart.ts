import { prisma } from "@/lib/db/prisma";
import { productCardInclude } from "@/lib/data/products";

export async function getUserCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: productCardInclude } },
  });
}

export async function getCartItemCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  const result = await prisma.cartItem.aggregate({ where: { userId }, _sum: { quantity: true } });
  return result._sum.quantity ?? 0;
}
