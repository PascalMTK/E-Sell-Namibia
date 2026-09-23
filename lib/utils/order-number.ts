import { prisma } from "@/lib/db/prisma";

/** Generates a human-readable, unique order number like "ESN-000123". */
export async function uniqueOrderNumber(): Promise<string> {
  let base = (await prisma.order.count()) + 1;
  for (;;) {
    const candidate = `ESN-${String(base).padStart(6, "0")}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
    base += 1;
  }
}
