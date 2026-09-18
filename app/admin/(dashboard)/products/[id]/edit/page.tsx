import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Admin · Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    getAllCategoriesForAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Edit Product</h1>
        <p className="text-sm text-secondary-text">{product.name}</p>
      </div>
      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={{
          name: product.name,
          shortDescription: product.shortDescription ?? "",
          description: product.description,
          categoryId: product.categoryId,
          brand: product.brand ?? "",
          model: product.model ?? "",
          sku: product.sku ?? "",
          images: product.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? "",
            isCover: img.isCover,
          })),
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
          negotiable: product.negotiable,
          condition: product.condition,
          location: product.location,
          pickupAvailable: product.pickupAvailable,
          windhoekDelivery: product.windhoekDelivery,
          nationwideDelivery: product.nationwideDelivery,
          quantity: product.quantity,
          stockStatus: product.stockStatus,
          published: product.published,
          featured: product.featured,
          newArrival: product.newArrival,
          onSale: product.onSale,
          sold: product.sold,
        }}
      />
    </div>
  );
}
