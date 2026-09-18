import { prisma } from "@/lib/db/prisma";

export async function getDockShowcaseProducts(limit = 10) {
  return prisma.product.findMany({
    where: { published: true, sold: false },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
