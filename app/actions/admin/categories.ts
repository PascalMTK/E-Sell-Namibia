"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { categoryFormSchema } from "@/lib/validation/admin";
import { uniqueCategorySlug } from "@/lib/utils/slug";

export interface CategoryActionState {
  success?: boolean;
  error?: string;
}

export async function createCategoryAction(input: unknown): Promise<CategoryActionState> {
  await requireAdmin();
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid category." };

  const slug = await uniqueCategorySlug(parsed.data.name);
  const maxPosition = await prisma.category.aggregate({ _max: { position: true } });

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      icon: parsed.data.icon || null,
      image: parsed.data.image || null,
      description: parsed.data.description || null,
      active: parsed.data.active,
      position: (maxPosition._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategoryAction(id: string, input: unknown): Promise<CategoryActionState> {
  await requireAdmin();
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid category." };

  const existing = await prisma.category.findUniqueOrThrow({ where: { id } });
  const slug = existing.name === parsed.data.name ? existing.slug : await uniqueCategorySlug(parsed.data.name, id);

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      icon: parsed.data.icon || null,
      image: parsed.data.image || null,
      description: parsed.data.description || null,
      active: parsed.data.active,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionState> {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: `Cannot delete: ${productCount} product(s) still use this category.` };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function reorderCategoryAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return;

  const a = categories[index];
  const b = categories[swapIndex];
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.category.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);
  revalidatePath("/admin/categories");
}
