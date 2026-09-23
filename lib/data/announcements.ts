import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const PAGE_SIZE = 10;

function activeWhere(): Prisma.AnnouncementWhereInput {
  const now = new Date();
  return {
    active: true,
    AND: [
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      { OR: [{ endDate: null }, { endDate: { gte: now } }] },
    ],
  };
}

export async function getActivePublicAnnouncements(page?: number) {
  const currentPage = page && page > 0 ? page : 1;
  const where = activeWhere();

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.announcement.count({ where }),
  ]);

  return { items, total, page: currentPage, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getAllAnnouncementsForAdmin() {
  return prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] });
}
