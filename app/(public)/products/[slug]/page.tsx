import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Truck, PackageCheck } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/products/image-gallery";
import { ProductContactCta } from "@/components/products/contact-cta";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { formatNad, calculateDiscountPercent } from "@/lib/utils/currency";
import { PRODUCT_CONDITIONS, STOCK_STATUSES } from "@/lib/constants";
import { getProductBySlug, getRelatedProducts, incrementProductViewCount } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/settings";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 150),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, session, settings] = await Promise.all([getProductBySlug(slug), auth(), getSiteSettings()]);

  if (!product) notFound();

  incrementProductViewCount(product.id);

  const [related, favoriteIds] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getUserFavoriteIds(session?.user?.id),
  ]);

  const discount = calculateDiscountPercent(product.price.toString(), product.originalPrice?.toString());
  const conditionLabel = PRODUCT_CONDITIONS.find((c) => c.value === product.condition)?.label ?? product.condition;

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <ImageGallery
            images={product.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText }))}
            productName={product.name}
          />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="dark">{product.category.name}</Badge>
            {product.newArrival && <Badge variant="yellow">New Arrival</Badge>}
            {discount && <Badge variant="danger">-{discount}% Off</Badge>}
            {product.sold && <Badge variant="neutral">SOLD</Badge>}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-black sm:text-3xl">{product.name}</h1>
            <FavoriteButton
              productId={product.id}
              initialFavorited={favoriteIds.has(product.id)}
              className="border border-gray-200"
            />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-black">{formatNad(product.price.toString())}</span>
            {product.originalPrice && (
              <span className="text-base text-gray-400 line-through">
                {formatNad(product.originalPrice.toString())}
              </span>
            )}
            {product.negotiable && <span className="text-xs font-semibold text-amber-700">Negotiable</span>}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-off-white p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-secondary-text">Condition</dt>
              <dd className="font-semibold text-brand-black">{conditionLabel}</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="text-xs text-secondary-text">Brand</dt>
                <dd className="font-semibold text-brand-black">{product.brand}</dd>
              </div>
            )}
            {product.model && (
              <div>
                <dt className="text-xs text-secondary-text">Model</dt>
                <dd className="font-semibold text-brand-black">{product.model}</dd>
              </div>
            )}
            {product.sku && (
              <div>
                <dt className="text-xs text-secondary-text">Reference</dt>
                <dd className="font-semibold text-brand-black">{product.sku}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-secondary-text">Location</dt>
              <dd className="flex items-center gap-1 font-semibold text-brand-black">
                <MapPin size={13} /> {product.location}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Availability</dt>
              <dd className="flex items-center gap-1 font-semibold text-brand-black">
                <PackageCheck size={13} />
                {product.sold
                  ? "Sold"
                  : STOCK_STATUSES.find((s) => s.value === product.stockStatus)?.label ?? product.stockStatus}
              </dd>
            </div>
          </dl>

          {(product.pickupAvailable || product.windhoekDelivery || product.nationwideDelivery) && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-secondary-text">
              {product.pickupAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5">
                  <Truck size={12} /> Pickup Available
                </span>
              )}
              {product.windhoekDelivery && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5">
                  <Truck size={12} /> Windhoek Delivery
                </span>
              )}
              {product.nationwideDelivery && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5">
                  <Truck size={12} /> Nationwide Delivery
                </span>
              )}
            </div>
          )}

          <div className="mt-7">
            {product.sold ? (
              <div className="rounded-xl border border-gray-200 bg-off-white p-4 text-sm font-semibold text-secondary-text">
                This item has been sold. Browse similar available products below.
              </div>
            ) : (
              <ProductContactCta
                productName={product.name}
                price={product.price.toString()}
                whatsappNumber={settings.whatsappNumber}
                phoneNumber={settings.phoneNumber}
              />
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="mb-2 text-sm font-bold text-brand-black">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-secondary-text">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-10">
          <SectionHeading title="Related products" />
          <div className="mt-6">
            <ProductGrid products={related} favoriteIds={favoriteIds} />
          </div>
        </div>
      )}
    </Container>
  );
}
