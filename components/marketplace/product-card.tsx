import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { ProductCardData } from "@/lib/data/products";
import { formatNad, calculateDiscountPercent } from "@/lib/utils/currency";
import { PRODUCT_CONDITIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/marketplace/favorite-button";

export function ProductCard({
  product,
  isFavorited = false,
}: {
  product: ProductCardData;
  isFavorited?: boolean;
}) {
  const cover = product.images.find((img) => img.isCover) ?? product.images[0];
  const discount = calculateDiscountPercent(product.price.toString(), product.originalPrice?.toString());
  const conditionLabel = PRODUCT_CONDITIONS.find((c) => c.value === product.condition)?.label ?? product.condition;
  const hasDelivery = product.windhoekDelivery || product.nationwideDelivery;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-off-white">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-secondary-text">No image</div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="dark" className="bg-white/90">
            {product.category.name}
          </Badge>
          {product.newArrival && <Badge variant="yellow">New</Badge>}
          {discount && <Badge variant="danger">-{discount}%</Badge>}
        </div>

        {product.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-md bg-white px-4 py-1.5 text-sm font-extrabold tracking-wide text-brand-black">
              SOLD
            </span>
          </div>
        )}
      </Link>

      <FavoriteButton
        productId={product.id}
        initialFavorited={isFavorited}
        className="absolute right-3 top-3"
      />

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-1.5 line-clamp-2 min-h-10 text-sm font-bold text-brand-black transition group-hover:text-amber-700">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-text">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {product.location}
          </span>
          <span>{conditionLabel}</span>
          {hasDelivery && (
            <span className="inline-flex items-center gap-1">
              <Truck size={12} /> Delivery
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-gray-100 pt-3">
          <div>
            <p className="text-lg font-extrabold text-brand-black">{formatNad(product.price.toString())}</p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">{formatNad(product.originalPrice.toString())}</p>
            )}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="rounded-lg bg-brand-black px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-charcoal"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
