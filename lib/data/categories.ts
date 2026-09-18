import { prisma } from "@/lib/db/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });
}

export async function getCategoriesWithProductCount() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
  return categories;
}

export async function getAllCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
