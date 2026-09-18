import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/card";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { ShopFilters } from "@/components/marketplace/shop-filters";
import { getPublishedProducts, ProductFilters } from "@/lib/data/products";
import { getActiveCategories } from "@/lib/data/categories";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

interface ShopSearchParams {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  location?: string;
  delivery?: string;
  sort?: string;
  page?: string;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const sp = await searchParams;
  const session = await auth();

  const filters: ProductFilters = {
    q: sp.q,
    category: sp.category,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    condition: sp.condition,
    location: sp.location,
    delivery: sp.delivery,
    sort: (sp.sort as ProductFilters["sort"]) || "newest",
    page: sp.page ? Number(sp.page) : 1,
  };

  const [{ items, total, page, pageCount }, categories, favoriteIds] = await Promise.all([
    getPublishedProducts(filters),
    getActiveCategories(),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Handpicked for you"
        title="Explore the marketplace"
        description={`${total} listing${total === 1 ? "" : "s"} reviewed and published by E-Sell Namibia.`}
      />

      <div className="mt-6">
        <ShopFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </div>

      <div className="mt-8">
        <ProductGrid products={items} favoriteIds={favoriteIds} />
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => {
            const pageNum = i + 1;
            const params = new URLSearchParams(sp as Record<string, string>);
            params.set("page", String(pageNum));
            return (
              <Link
                key={pageNum}
                href={`/shop?${params.toString()}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold",
                  pageNum === page
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-gray-300 bg-white text-brand-black hover:border-brand-black",
                )}
              >
                {pageNum}
              </Link>
            );
          })}
        </nav>
      )}
    </Container>
  );
}
