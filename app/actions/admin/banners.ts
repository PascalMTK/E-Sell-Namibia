"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { bannerFormSchema } from "@/lib/validation/admin";

export interface BannerActionState {
  success?: boolean;
  error?: string;
}

export async function createBannerAction(input: unknown): Promise<BannerActionState> {
  await requireAdmin();
  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid banner." };

  const maxPosition = await prisma.banner.aggregate({ _max: { position: true } });
  await prisma.banner.create({
    data: {
      heading: parsed.data.heading,
      subtitle: parsed.data.subtitle || null,
      image: parsed.data.image,
      ctaLabel: parsed.data.ctaLabel || null,
      destination: parsed.data.destination || null,
      active: parsed.data.active,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      position: (maxPosition._max.position ?? 0) + 1,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function updateBannerAction(id: string, input: unknown): Promise<BannerActionState> {
  await requireAdmin();
  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid banner." };

  await prisma.banner.update({
    where: { id },
    data: {
      heading: parsed.data.heading,
      subtitle: parsed.data.subtitle || null,
      image: parsed.data.image,
      ctaLabel: parsed.data.ctaLabel || null,
      destination: parsed.data.destination || null,
      active: parsed.data.active,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBannerActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
