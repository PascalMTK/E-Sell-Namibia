import slugify from "slugify";
import { prisma } from "@/lib/db/prisma";

export function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, trim: true });
}

/** Ensures a unique product slug by appending -2, -3, ... when needed. */
export async function uniqueProductSlug(name: string, ignoreId?: string): Promise<string> {
  const base = toSlug(name) || "item";
  let slug = base;
  let suffix = 2;
  for (;;) {
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function uniqueCategorySlug(name: string, ignoreId?: string): Promise<string> {
  const base = toSlug(name) || "category";
  let slug = base;
  let suffix = 2;
  for (;;) {
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}
