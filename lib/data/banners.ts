import { prisma } from "@/lib/db/prisma";

export async function getActiveBanners() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { position: "asc" },
  });
}

export async function getAllBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: { position: "asc" } });
}
