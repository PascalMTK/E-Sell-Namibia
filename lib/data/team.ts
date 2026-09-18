import { prisma } from "@/lib/db/prisma";

export async function getActiveTeamMembers() {
  return prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { position_: "asc" },
  });
}

export async function getAllTeamMembersForAdmin() {
  return prisma.teamMember.findMany({ orderBy: { position_: "asc" } });
}
