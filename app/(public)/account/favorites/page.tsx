import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/card";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { requireUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { productCardInclude } from "@/lib/data/products";

export const metadata: Metadata = { title: "Favorites" };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { include: productCardInclude } },
  });

  const products = favorites.map((f) => f.product);

  return (
    <div>
      <SectionHeading title="Favorites" description="Products you've saved for later." />
      <div className="mt-8">
        <ProductGrid
          products={products}
          favoriteIds={new Set(products.map((p) => p.id))}
          emptyTitle="You haven't saved any products"
          emptyDescription="Tap the heart icon on any listing to save it here."
        />
      </div>
    </div>
  );
}
