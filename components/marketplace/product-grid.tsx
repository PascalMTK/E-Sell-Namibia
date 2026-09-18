import { PackageSearch } from "lucide-react";
import { ProductCardData } from "@/lib/data/products";
import { ProductCard } from "@/components/marketplace/product-card";
import { EmptyState, Skeleton } from "@/components/ui/card";

export function ProductGrid({
  products,
  favoriteIds,
  emptyTitle = "No products found",
  emptyDescription = "Try a different search or check back soon.",
}: {
  products: ProductCardData[];
  favoriteIds?: Set<string>;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch size={36} />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isFavorited={favoriteIds?.has(product.id)} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
