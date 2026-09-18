import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Admin · Convert Sell Request" };
export const dynamic = "force-dynamic";

export default async function ConvertSellRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sellRequest, categories] = await Promise.all([
    prisma.sellRequest.findUnique({ where: { id }, include: { photos: { orderBy: { position: "asc" } } } }),
    getAllCategoriesForAdmin(),
  ]);

  if (!sellRequest) notFound();
  if (sellRequest.status === "CONVERTED") redirect(`/admin/sell-requests/${id}`);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Convert Sell Request to Product</h1>
        <p className="text-sm text-secondary-text">
          Review and complete the details below before publishing. All fields can be changed.
        </p>
      </div>
      <ProductForm
        categories={categories}
        sourceSellRequestId={sellRequest.id}
        defaultValues={{
          name: sellRequest.productName,
          description: sellRequest.description,
          categoryId: sellRequest.categoryId ?? "",
          brand: sellRequest.brand ?? "",
          model: sellRequest.model ?? "",
          condition: sellRequest.condition,
          location: "Windhoek",
          price: sellRequest.expectedPrice ? Number(sellRequest.expectedPrice) : undefined,
          negotiable: sellRequest.negotiable,
          images: sellRequest.photos.map((photo, index) => ({
            url: photo.url,
            isCover: index === 0,
          })),
        }}
      />
    </div>
  );
}
