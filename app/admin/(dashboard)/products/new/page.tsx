import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Admin · Add Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Add Product</h1>
        <p className="text-sm text-secondary-text">Create a new product listing for ESell Namibia.</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
