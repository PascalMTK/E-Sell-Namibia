export function formatNad(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "N$ 0";
  return `N$ ${value.toLocaleString("en-NA", { maximumFractionDigits: 0 })}`;
}

export function calculateDiscountPercent(
  price: number | string,
  originalPrice: number | string | null | undefined,
): number | null {
  if (originalPrice == null) return null;
  const p = typeof price === "string" ? Number(price) : price;
  const op = typeof originalPrice === "string" ? Number(originalPrice) : originalPrice;
  if (!Number.isFinite(p) || !Number.isFinite(op) || op <= p || op <= 0) return null;
  return Math.round(((op - p) / op) * 100);
}
