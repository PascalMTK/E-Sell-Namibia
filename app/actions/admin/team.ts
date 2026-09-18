"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { teamMemberFormSchema } from "@/lib/validation/admin";

export interface TeamActionState {
  success?: boolean;
  error?: string;
}

export async function createTeamMemberAction(input: unknown): Promise<TeamActionState> {
  await requireAdmin();
  const parsed = teamMemberFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid team member." };

  const maxPosition = await prisma.teamMember.aggregate({ _max: { position_: true } });
  await prisma.teamMember.create({
    data: {
      name: parsed.data.name,
      position: parsed.data.position,
      bio: parsed.data.bio || null,
      photo: parsed.data.photo || null,
      linkedin: parsed.data.linkedin || null,
      twitter: parsed.data.twitter || null,
      email: parsed.data.email || null,
      active: parsed.data.active,
      position_: (maxPosition._max.position_ ?? 0) + 1,
    },
  });

  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true };
}

export async function updateTeamMemberAction(id: string, input: unknown): Promise<TeamActionState> {
  await requireAdmin();
  const parsed = teamMemberFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid team member." };

  await prisma.teamMember.update({
    where: { id },
    data: {
      name: parsed.data.name,
      position: parsed.data.position,
      bio: parsed.data.bio || null,
      photo: parsed.data.photo || null,
      linkedin: parsed.data.linkedin || null,
      twitter: parsed.data.twitter || null,
      email: parsed.data.email || null,
      active: parsed.data.active,
    },
  });

  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteTeamMemberAction(id: string) {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function toggleTeamMemberActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.teamMember.update({ where: { id }, data: { active } });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}
