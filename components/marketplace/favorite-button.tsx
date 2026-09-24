"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toggleFavoriteAction } from "@/app/actions/favorites";

export function FavoriteButton({
  productId,
  initialFavorited,
  className,
}: {
  productId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      disabled={isPending}
      onClick={() => {
        setFavorited((v) => !v);
        startTransition(async () => {
          const result = await toggleFavoriteAction(productId);
          if (result.requiresLogin) {
            setFavorited(false);
            router.push("/login");
            return;
          }
          setFavorited(Boolean(result.favorited));
        });
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-black shadow-sm transition hover:bg-white disabled:opacity-60",
        className,
      )}
    >
      <Heart size={16} fill={favorited ? "#d99000" : "none"} className={favorited ? "text-brand-yellow-hover" : ""} />
    </button>
  );
}
