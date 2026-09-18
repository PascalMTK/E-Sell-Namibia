import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Search, ShieldCheck, Truck, Users, MessageCircle } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { CategoryGrid } from "@/components/marketplace/category-grid";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { getCategoriesWithProductCount } from "@/lib/data/categories";
import { getFeaturedProducts, getNewArrivals } from "@/lib/data/products";
import { getActiveBanners } from "@/lib/data/banners";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const [categories, featured, newArrivals, favoriteIds, banners] = await Promise.all([
    getCategoriesWithProductCount(),
    getFeaturedProducts(8),
    getNewArrivals(8),
    getUserFavoriteIds(session?.user?.id),
    getActiveBanners(),
  ]);

  return (
    <>
      {banners.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="flex snap-x gap-4 overflow-x-auto p-4">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.destination || "/shop"}
                className="relative h-40 w-full shrink-0 snap-start overflow-hidden rounded-xl sm:w-105"
              >
                <Image src={banner.image} alt={banner.heading} fill sizes="420px" className="object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 to-transparent p-4 text-white">
                  <p className="text-sm font-extrabold">{banner.heading}</p>
                  {banner.subtitle && <p className="text-xs text-gray-200">{banner.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="border-b border-gray-100 bg-off-white">
        <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-1 text-xs font-bold text-amber-700">
              <MapPin size={12} /> Namibia&rsquo;s Buying & Selling Platform
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-black sm:text-5xl">
              Buying & Selling made easier for everyone.
            </h1>
            <p className="mt-5 max-w-lg text-base text-secondary-text">
              Discover quality new and second-hand products across Namibia, or send us the goods you want to
              sell.
            </p>

            <form action="/shop" className="mt-8 flex max-w-md rounded-xl border border-gray-300 bg-white p-1.5 shadow-sm">
              <input
                name="q"
                placeholder="What are you looking for?"
                className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black transition hover:bg-brand-yellow-hover"
              >
                <Search size={15} /> Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" size="lg">
                Shop Now
              </ButtonLink>
              <ButtonLink href="/sell" variant="secondary" size="lg">
                Sell Your Goods
              </ButtonLink>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-xs font-semibold text-secondary-text">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-600" /> Windhoek, Namibia
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck size={14} className="text-amber-600" /> Nationwide Delivery
              </span>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=85"
              alt="Curated goods available through E-Sell Namibia"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Explore E-Sell"
            title="Shop by category"
            action={
              <Link href="/categories" className="text-sm font-bold text-brand-black hover:text-amber-700">
                View all categories <ArrowRight size={14} className="inline" />
              </Link>
            }
          />
          <div className="mt-8">
            {categories.length > 0 ? (
              <CategoryGrid categories={categories} />
            ) : (
              <p className="text-sm text-secondary-text">Categories will appear here once E-Sell adds them.</p>
            )}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="bg-off-white py-16">
        <Container>
          <SectionHeading
            eyebrow="Handpicked for you"
            title="Featured Products"
            action={
              <Link href="/shop" className="text-sm font-bold text-brand-black hover:text-amber-700">
                Browse marketplace <ArrowRight size={14} className="inline" />
              </Link>
            }
          />
          <div className="mt-8">
            <ProductGrid
              products={featured}
              favoriteIds={favoriteIds}
              emptyTitle="No featured products yet"
              emptyDescription="E-Sell hasn't marked any products as featured yet. Check back soon."
            />
          </div>
        </Container>
      </section>

      {/* New arrivals */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Just listed" title="New Arrivals" />
          <div className="mt-8">
            <ProductGrid
              products={newArrivals}
              favoriteIds={favoriteIds}
              emptyTitle="No new arrivals yet"
              emptyDescription="Newly published products will show up here."
            />
          </div>
        </Container>
      </section>

      {/* Sell CTA */}
      <section className="bg-brand-black py-16 text-white">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-yellow">
              Have something to sell?
            </p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Give your goods a new beginning.
            </h2>
            <p className="mt-4 max-w-md text-sm text-gray-400">
              Tell us about your item. The E-Sell team reviews each request and contacts you before anything is
              listed.
            </p>
            <ButtonLink href="/sell" className="mt-6">
              Sell Your Goods <ArrowRight size={15} />
            </ButtonLink>
          </div>
          <div className="flex justify-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
            <span className="rounded-full border border-brand-border px-4 py-2">Submit</span>
            <ArrowRight className="my-auto text-brand-yellow" size={16} />
            <span className="rounded-full border border-brand-border px-4 py-2">Review</span>
            <ArrowRight className="my-auto text-brand-yellow" size={16} />
            <span className="rounded-full border border-brand-border px-4 py-2">List</span>
          </div>
        </Container>
      </section>

      {/* Trust */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Why buy through E-Sell" title="Built around trust, not guesswork" />
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <ShieldCheck size={20} />, title: "Products reviewed by E-Sell", body: "Every listing is checked by our team before it reaches the marketplace." },
              { icon: <Users size={20} />, title: "Local Namibian support", body: "Based in Windhoek, with a team that understands buyers and sellers nationwide." },
              { icon: <MessageCircle size={20} />, title: "Easy product enquiries", body: "Reach E-Sell directly about any listing." },
              { icon: <Truck size={20} />, title: "Nationwide delivery options", body: "Delivery availability is shown on each listing before you enquire." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/15 text-amber-700">
                  {item.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-brand-black">{item.title}</h3>
                <p className="text-xs leading-relaxed text-secondary-text">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
