"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { addToCartAction } from "@/app/actions/cart";
import { useToast } from "@/components/ui/toast";

export function AddToCartButton({
  productId,
  disabled = false,
  className,
  iconOnly = false,
}: {
  productId: string;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCartAction(productId);
      if (result.requiresLogin) {
        router.push("/login");
        return;
      }
      if (result.error) {
        showToast({ kind: "error", title: "Could not add to cart", message: result.error });
        return;
      }
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 2000);
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        aria-label="Add to cart"
        disabled={disabled || isPending}
        onClick={handleClick}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-black shadow-sm transition hover:bg-white disabled:opacity-60",
          className,
        )}
      >
        {added ? <Check size={16} className="text-green-600" /> : <ShoppingCart size={16} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={handleClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-black transition hover:bg-brand-yellow-hover disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {added ? (
        <>
          <Check size={16} /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart size={16} /> Add to Cart
        </>
      )}
    </button>
  );
}
