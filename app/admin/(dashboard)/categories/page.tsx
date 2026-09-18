import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Admin · Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Categories</h1>
        <p className="text-sm text-secondary-text">Manage the categories customers use to browse E-Sell Namibia.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
