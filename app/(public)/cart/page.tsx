import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/card";
import { CartView } from "@/components/cart/cart-view";
import { requireUser } from "@/lib/auth/permissions";
import { getUserCartItems } from "@/lib/data/cart";

export const metadata: Metadata = { title: "Your Cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await requireUser();
  const items = await getUserCartItems(user.id);

  return (
    <Container className="py-10">
      <SectionHeading title="Your Cart" description="Review your items before checking out." />
      <div className="mt-8">
        <CartView
          items={items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              id: item.product.id,
              slug: item.product.slug,
              name: item.product.name,
              price: item.product.price.toString(),
              quantity: item.product.quantity,
              image: item.product.images.find((img) => img.isCover)?.url ?? item.product.images[0]?.url ?? null,
            },
          }))}
        />
      </div>
    </Container>
  );
}
