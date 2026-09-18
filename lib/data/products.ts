import { Prisma, ProductCondition } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const productCardInclude = {
  images: { orderBy: { position: "asc" as const } },
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

const PAGE_SIZE = 12;

export interface ProductFilters {
  q?: string;
  category?: string; // slug
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  delivery?: string; // pickup | windhoek | nationwide
  sort?: "newest" | "featured" | "price-asc" | "price-desc";
  page?: number;
}

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { published: true };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { brand: { contains: filters.q, mode: "insensitive" } },
      { model: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { location: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.category) where.category = { slug: filters.category };
  if (filters.condition) where.condition = filters.condition as ProductCondition;
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.delivery === "pickup") where.pickupAvailable = true;
  if (filters.delivery === "windhoek") where.windhoekDelivery = true;
  if (filters.delivery === "nationwide") where.nationwideDelivery = true;
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }

  return where;
}

function buildOrderBy(sort: ProductFilters["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "featured":
      return [{ featured: "desc" }, { createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function getPublishedProducts(filters: ProductFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = buildWhere(filters);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { published: true, featured: true, sold: false },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { published: true, newArrival: true, sold: false },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, published: true },
    include: productCardInclude,
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { published: true, categoryId, id: { not: excludeId } },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function incrementProductViewCount(id: string) {
  await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
}
