import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Prisma, ProductCondition } from "@prisma/client";
import { ButtonLink } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import { prisma } from "@/lib/db/prisma";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Admin · Products" };
export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  status?: string; // published | draft
  condition?: string;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { sku: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.category) where.categoryId = sp.category;
  if (sp.status === "published") where.published = true;
  if (sp.status === "draft") where.published = false;
  if (sp.condition) where.condition = sp.condition as ProductCondition;

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    getAllCategoriesForAdmin(),
  ]);

  const products = productsRaw.map((p) => ({
    ...p,
    price: p.price.toString(),
    originalPrice: p.originalPrice?.toString() ?? null,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black">Products</h1>
          <p className="text-sm text-secondary-text">Manage all products available on ESell Namibia.</p>
        </div>
        <ButtonLink href="/admin/products/new">
          <Plus size={16} /> Add Product
        </ButtonLink>
      </div>

      <ProductsTable products={products} categories={categories} />

      {products.length === 0 && (
        <p className="mt-6 text-center text-sm text-secondary-text">
          No products yet. <Link href="/admin/products/new" className="font-semibold text-brand-yellow-hover">Add your first product</Link>.
        </p>
      )}
    </div>
  );
}
