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
          className="group flex min-h-[142px] flex-col items-start justify-between rounded-xl border border-[#e8e4d8] bg-[#faf8f1] p-4 transition hover:-translate-y-1 hover:border-brand-yellow hover:bg-[#fff0b8] hover:shadow-[0_10px_24px_rgba(60,45,0,0.1)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-2xl shadow-sm transition group-hover:bg-brand-black group-hover:text-brand-yellow">
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
