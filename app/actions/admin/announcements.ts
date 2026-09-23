"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { announcementFormSchema } from "@/lib/validation/admin";

export interface AnnouncementActionState {
  success?: boolean;
  error?: string;
}

function revalidateAnnouncementPaths() {
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
}

export async function createAnnouncementAction(input: unknown): Promise<AnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = announcementFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid announcement." };

  const created = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      image: parsed.data.image || null,
      active: parsed.data.active,
      pinned: parsed.data.pinned,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await prisma.adminActivity.create({
    data: { adminId: admin.id, type: "ANNOUNCEMENT_CHANGED", description: `Announcement "${created.title}" created`, targetId: created.id },
  });

  revalidateAnnouncementPaths();
  return { success: true };
}

export async function updateAnnouncementAction(id: string, input: unknown): Promise<AnnouncementActionState> {
  const admin = await requireAdmin();
  const parsed = announcementFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid announcement." };

  await prisma.announcement.update({
    where: { id },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      image: parsed.data.image || null,
      active: parsed.data.active,
      pinned: parsed.data.pinned,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await prisma.adminActivity.create({
    data: { adminId: admin.id, type: "ANNOUNCEMENT_CHANGED", description: `Announcement "${parsed.data.title}" updated`, targetId: id },
  });

  revalidateAnnouncementPaths();
  return { success: true };
}

export async function deleteAnnouncementAction(id: string): Promise<AnnouncementActionState> {
  const admin = await requireAdmin();
  const announcement = await prisma.announcement.delete({ where: { id } });

  await prisma.adminActivity.create({
    data: { adminId: admin.id, type: "ANNOUNCEMENT_CHANGED", description: `Announcement "${announcement.title}" deleted`, targetId: id },
  });

  revalidateAnnouncementPaths();
  return { success: true };
}

export async function toggleAnnouncementActiveAction(id: string, active: boolean): Promise<AnnouncementActionState> {
  await requireAdmin();
  await prisma.announcement.update({ where: { id }, data: { active } });
  revalidateAnnouncementPaths();
  return { success: true };
}

export async function togglePinnedAction(id: string, pinned: boolean): Promise<AnnouncementActionState> {
  await requireAdmin();
  await prisma.announcement.update({ where: { id }, data: { pinned } });
  revalidateAnnouncementPaths();
  return { success: true };
}
