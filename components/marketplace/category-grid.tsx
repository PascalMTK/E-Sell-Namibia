import Link from "next/link";
import { Package } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count?: { products: number };
}

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop?category=${category.slug}`}
          className="flex min-h-[130px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-off-white p-4 transition hover:-translate-y-0.5 hover:border-brand-yellow hover:bg-brand-yellow/10"
        >
          <span className="text-2xl">
            {category.icon || <Package size={24} className="text-amber-700" />}
          </span>
          <span>
            <span className="block text-sm font-bold text-brand-black">{category.name}</span>
            {typeof category._count?.products === "number" && (
              <span className="text-xs text-secondary-text">{category._count.products} listings</span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
