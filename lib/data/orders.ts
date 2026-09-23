import { Prisma, OrderStatus, StockStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const ORDERS_PAGE_SIZE = 20;

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
}

function buildWhere(filters: OrderFilters): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  return where;
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { customerId: userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserOrderById(userId: string, id: string) {
  return prisma.order.findFirst({
    where: { id, customerId: userId },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getAdminOrders(filters: OrderFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = buildWhere(filters);

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page, pageSize: ORDERS_PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)) };
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

function deriveStockFields(quantity: number): { quantity: number; sold: boolean; stockStatus: StockStatus } {
  const clamped = Math.max(0, quantity);
  if (clamped <= 0) return { quantity: 0, sold: true, stockStatus: "OUT_OF_STOCK" };
  if (clamped <= 2) return { quantity: clamped, sold: false, stockStatus: "LOW_STOCK" };
  return { quantity: clamped, sold: false, stockStatus: "IN_STOCK" };
}

/** Decrements product stock after an order is committed (cash at placement, card after payment verification). */
export async function applyProductStockDecrement(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
) {
  for (const item of items) {
    const product = await tx.product.update({
      where: { id: item.productId },
      data: { quantity: { decrement: item.quantity } },
    });
    const derived = deriveStockFields(product.quantity);
    await tx.product.update({ where: { id: item.productId }, data: derived });
  }
}

/** Restores product stock when a committed order is cancelled. */
export async function restockOrderItems(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
) {
  for (const item of items) {
    const product = await tx.product.update({
      where: { id: item.productId },
      data: { quantity: { increment: item.quantity } },
    });
    const derived = deriveStockFields(product.quantity);
    await tx.product.update({ where: { id: item.productId }, data: derived });
  }
}
