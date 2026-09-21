"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { productFormSchema, ProductFormValues } from "@/lib/validation/product";
import { uniqueProductSlug } from "@/lib/utils/slug";
import { notifyUsersOfNewProduct } from "@/lib/email/new-product-notification";

export interface ProductActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  productId?: string;
}

async function logActivity(
  adminId: string,
  type:
    | "PRODUCT_CREATED"
    | "PRODUCT_UPDATED"
    | "PRODUCT_PUBLISHED"
    | "PRODUCT_UNPUBLISHED"
    | "PRODUCT_SOLD"
    | "PRODUCT_DELETED",
  description: string,
  targetId?: string,
) {
  await prisma.adminActivity.create({ data: { adminId, type, description, targetId } }).catch(() => {});
}

export async function createProductAction(
  input: unknown,
  sourceSellRequestId?: string,
): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors, error: "Please check the highlighted fields." };
  }

  const data = parsed.data;
  const slug = await uniqueProductSlug(data.name);

  const product = await prisma.product.create({
    data: {
      ...buildProductData(data, slug, admin.id),
      ...(sourceSellRequestId ? { sourceSellRequestId } : {}),
    },
    include: { images: true },
  });

  if (product.published) {
    await notifyUsersOfNewProduct(product).catch((error) =>
      console.error("[email] Failed to notify users of new product:", error),
    );
  }

  if (sourceSellRequestId) {
    await prisma.$transaction([
      prisma.sellRequest.update({ where: { id: sourceSellRequestId }, data: { status: "CONVERTED" } }),
      prisma.statusHistoryEntry.create({
        data: { sellRequestId: sourceSellRequestId, status: "CONVERTED", note: `Converted to product "${product.name}"` },
      }),
      prisma.adminActivity.create({
        data: {
          adminId: admin.id,
          type: "SELL_REQUEST_CONVERTED",
          description: `Converted sell request to product "${product.name}"`,
          targetId: sourceSellRequestId,
        },
      }),
    ]);
    revalidatePath("/admin/sell-requests");
    revalidatePath(`/admin/sell-requests/${sourceSellRequestId}`);
  }

  await logActivity(admin.id, "PRODUCT_CREATED", `Created product "${product.name}"`, product.id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true, productId: product.id };
}

export async function updateProductAction(productId: string, input: unknown): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors, error: "Please check the highlighted fields." };
  }

  const existing = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const data = parsed.data;
  const slug = data.name === existing.name ? existing.slug : await uniqueProductSlug(data.name, productId);

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: buildProductData(data, slug),
    }),
  ]);

  await logActivity(admin.id, "PRODUCT_UPDATED", `Updated product "${data.name}"`, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/shop");
  revalidatePath("/");

  return { success: true, productId };
}

function buildProductData(data: ProductFormValues, slug: string, createdById?: string) {
  return {
    name: data.name,
    slug,
    sku: data.sku || null,
    shortDescription: data.shortDescription || null,
    description: data.description,
    price: data.price,
    originalPrice: data.originalPrice ?? null,
    negotiable: data.negotiable,
    condition: data.condition,
    brand: data.brand || null,
    model: data.model || null,
    location: data.location,
    pickupAvailable: data.pickupAvailable,
    windhoekDelivery: data.windhoekDelivery,
    nationwideDelivery: data.nationwideDelivery,
    quantity: data.quantity,
    stockStatus: data.stockStatus,
    published: data.published,
    featured: data.featured,
    newArrival: data.newArrival,
    onSale: data.onSale,
    sold: data.sold,
    categoryId: data.categoryId,
    publishedAt: data.published ? new Date() : null,
    ...(createdById ? { createdById } : {}),
    images: {
      create: data.images.map((img, index) => ({
        url: img.url,
        altText: img.altText || null,
        isCover: img.isCover,
        position: index,
      })),
    },
  };
}

export async function deleteProductAction(productId: string) {
  const admin = await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  await prisma.product.delete({ where: { id: productId } });
  if (product) await logActivity(admin.id, "PRODUCT_DELETED", `Deleted product "${product.name}"`, productId);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductPublishedAction(productId: string, published: boolean) {
  const admin = await requireAdmin();
  const existing = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const isFirstPublish = published && !existing.publishedAt;

  const product = await prisma.product.update({
    where: { id: productId },
    data: { published, publishedAt: existing.publishedAt ?? (published ? new Date() : null) },
    include: { images: true },
  });
  await logActivity(
    admin.id,
    published ? "PRODUCT_PUBLISHED" : "PRODUCT_UNPUBLISHED",
    `${published ? "Published" : "Unpublished"} product "${product.name}"`,
    productId,
  );

  if (isFirstPublish) {
    await notifyUsersOfNewProduct(product).catch((error) =>
      console.error("[email] Failed to notify users of new product:", error),
    );
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function markProductSoldAction(productId: string, sold: boolean) {
  const admin = await requireAdmin();
  const product = await prisma.product.update({
    where: { id: productId },
    data: { sold, stockStatus: sold ? "SOLD" : "IN_STOCK" },
  });
  await logActivity(admin.id, "PRODUCT_SOLD", `Marked "${product.name}" as ${sold ? "sold" : "available"}`, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
}

export async function duplicateProductAction(productId: string) {
  await requireAdmin();
  const original = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { images: true },
  });

  const slug = await uniqueProductSlug(`${original.name} copy`);

  await prisma.product.create({
    data: {
      name: `${original.name} (Copy)`,
      slug,
      shortDescription: original.shortDescription,
      description: original.description,
      price: original.price,
      originalPrice: original.originalPrice,
      negotiable: original.negotiable,
      condition: original.condition,
      brand: original.brand,
      model: original.model,
      location: original.location,
      pickupAvailable: original.pickupAvailable,
      windhoekDelivery: original.windhoekDelivery,
      nationwideDelivery: original.nationwideDelivery,
      quantity: original.quantity,
      stockStatus: original.stockStatus,
      published: false,
      featured: false,
      newArrival: original.newArrival,
      onSale: original.onSale,
      sold: false,
      categoryId: original.categoryId,
      images: {
        create: original.images.map((img) => ({
          url: img.url,
          altText: img.altText,
          isCover: img.isCover,
          position: img.position,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
}
