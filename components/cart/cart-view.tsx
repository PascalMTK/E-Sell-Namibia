"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { formatNad } from "@/lib/utils/currency";
import { updateCartItemQuantityAction, removeFromCartAction } from "@/app/actions/cart";
import { useToast } from "@/components/ui/toast";

interface CartLineItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: string;
    quantity: number;
    image: string | null;
  };
}

export function CartView({ items: initialItems }: { items: CartLineItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  );

  function changeQuantity(item: CartLineItem, nextQuantity: number) {
    const clamped = Math.min(Math.max(nextQuantity, 0), item.product.quantity);
    setItems((prev) =>
      clamped < 1 ? prev.filter((i) => i.id !== item.id) : prev.map((i) => (i.id === item.id ? { ...i, quantity: clamped } : i)),
    );
    startTransition(async () => {
      const result = await updateCartItemQuantityAction(item.id, clamped);
      if (result.error) showToast({ kind: "error", title: "Could not update cart", message: result.error });
    });
  }

  function remove(item: CartLineItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    startTransition(async () => {
      const result = await removeFromCartAction(item.id);
      if (result.error) showToast({ kind: "error", title: "Could not remove item", message: result.error });
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={36} />}
        title="Your cart is empty"
        description="Browse the marketplace and add products you'd like to buy."
        action={<ButtonLink href="/shop">Shop Now</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <Link href={`/products/${item.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-off-white">
              {item.product.image && (
                <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-cover" />
              )}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/products/${item.product.slug}`} className="text-sm font-bold text-brand-black hover:text-brand-yellow-hover">
                  {item.product.name}
                </Link>
                <button
                  onClick={() => remove(item)}
                  aria-label="Remove from cart"
                  className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                  <button
                    onClick={() => changeQuantity(item, item.quantity - 1)}
                    disabled={isPending}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center text-secondary-text hover:text-brand-black disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-brand-black">{item.quantity}</span>
                  <button
                    onClick={() => changeQuantity(item, item.quantity + 1)}
                    disabled={isPending || item.quantity >= item.product.quantity}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center text-secondary-text hover:text-brand-black disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-bold text-brand-black">{formatNad(Number(item.product.price) * item.quantity)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-xl border border-gray-200 bg-off-white p-5">
        <h2 className="mb-4 text-sm font-bold text-brand-black">Order Summary</h2>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-extrabold text-brand-black">
          <span>Total</span>
          <span>{formatNad(subtotal)}</span>
        </div>
        <ButtonLink href="/checkout" className="mt-5 w-full">
          Proceed to Checkout
        </ButtonLink>
      </div>
    </div>
  );
}
