import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container, SectionHeading } from "@/components/ui/card";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requireUser } from "@/lib/auth/permissions";
import { getUserCartItems } from "@/lib/data/cart";
import { isDpoConfigured } from "@/lib/payments/dpo";
import { formatNad } from "@/lib/utils/currency";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser();
  const items = await getUserCartItems(user.id);

  if (items.length === 0) redirect("/cart");

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <Container className="py-10">
      <SectionHeading title="Checkout" description="Confirm your order details and choose how to pay." />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm dpoAvailable={isDpoConfigured()} />
        </div>
        <div className="h-fit rounded-xl border border-gray-200 bg-off-white p-5">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Order Summary</h2>
          <ul className="space-y-2 text-sm text-secondary-text">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span className="line-clamp-1">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="shrink-0 font-semibold text-brand-black">
                  {formatNad(Number(item.product.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-extrabold text-brand-black">
            <span>Total</span>
            <span>{formatNad(total)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
