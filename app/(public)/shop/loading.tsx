import { Container } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/card";
import { ProductGridSkeleton } from "@/components/marketplace/product-grid";

export default function ShopLoading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}
