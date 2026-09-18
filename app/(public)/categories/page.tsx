import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/card";
import { CategoryGrid } from "@/components/marketplace/category-grid";
import { getCategoriesWithProductCount } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithProductCount();

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Browse ESell"
        title="All categories"
        description="Find electronics, vehicles, furniture, fashion and more from ESell Namibia's reviewed listings."
      />
      <div className="mt-8">
        {categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <p className="text-sm text-secondary-text">Categories will appear here once ESell adds them.</p>
        )}
      </div>
    </Container>
  );
}
