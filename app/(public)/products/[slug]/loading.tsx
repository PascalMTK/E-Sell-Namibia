import { Container, Skeleton } from "@/components/ui/card";

export default function ProductLoading() {
  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </Container>
  );
}
