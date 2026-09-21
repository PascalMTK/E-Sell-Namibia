import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Search, ShieldCheck, ShoppingBag, Tag, Truck, Users, MessageCircle } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { CategoryGrid } from "@/components/marketplace/category-grid";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { GalleryDock } from "@/components/marketplace/gallery-dock";
import { getCategoriesWithProductCount } from "@/lib/data/categories";
import { getFeaturedProducts, getNewArrivals } from "@/lib/data/products";
import { getActiveBanners } from "@/lib/data/banners";
import { getDockShowcaseProducts } from "@/lib/data/showcase";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const [categories, featured, newArrivals, favoriteIds, banners, showcaseProducts] = await Promise.all([
    getCategoriesWithProductCount(),
    getFeaturedProducts(8),
    getNewArrivals(8),
    getUserFavoriteIds(session?.user?.id),
    getActiveBanners(),
    getDockShowcaseProducts(10),
  ]);

  const dockItems = showcaseProducts
    .filter((p) => p.images[0])
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price.toString(),
      image: p.images[0].url,
    }));

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
      <section className="relative overflow-hidden border-b border-[#eadcae] bg-[#fff9e8]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-brand-yellow sm:w-3" />
        <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="hero-copy-enter">
            <p className="mb-5 inline-flex items-center gap-2 border-l-4 border-brand-yellow pl-3 text-xs font-extrabold uppercase tracking-wider text-[#765600]">
              <MapPin size={12} /> Namibia&rsquo;s Buying & Selling Platform
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.055em] text-brand-black sm:text-5xl lg:text-[3.55rem]">
              Buying & Selling made easier <span className="bg-brand-yellow px-1 text-brand-black box-decoration-clone">for everyone.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#514c3f]">
              Discover quality new and second-hand products across Namibia, or send us the goods you want to
              sell.
            </p>

            <form action="/shop" className="mt-8 flex max-w-md rounded-xl border border-[#d9cfae] bg-white p-1.5 shadow-[0_8px_24px_rgba(80,58,0,0.1)]">
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
                <ShoppingBag size={16} /> Shop Now
              </ButtonLink>
              <ButtonLink href="/sell" variant="secondary" size="lg">
                <Tag size={16} /> Sell Your Goods
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

          <div className="hero-media-enter relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border-8 border-white shadow-[16px_16px_0_#ffc107] lg:mr-4 lg:mb-4">
              <Image
                src="https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=85"
                alt="Curated goods available through ESell Namibia"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 flex items-center gap-3 bg-brand-black px-4 py-3 text-xs font-bold uppercase tracking-wider text-white">
                <span className="h-2 w-2 bg-brand-yellow" /> Discover your next great find
              </div>
            </div>
            <div className="absolute -top-4 -left-4 z-10 flex items-center gap-2 rounded-xl border border-[#eadcae] bg-white px-4 py-2.5 shadow-[0_10px_28px_rgba(80,58,0,0.16)] sm:-left-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-black">
                <ShieldCheck size={16} />
              </span>
              <span>
                <span className="block text-xs font-extrabold text-brand-black">Reviewed by ESell</span>
                <span className="block text-[10px] font-semibold text-secondary-text">Every listing checked first</span>
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Interactive showcase dock */}
      {dockItems.length > 0 && (
        <section className="bg-brand-deep-black py-14">
          <Container>
            <Reveal className="mb-8 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-yellow">
                Interactive Showcase
              </p>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Hover to explore</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                Move your cursor across the dock to preview featured finds — or tap and scroll on mobile.
              </p>
            </Reveal>
            <Reveal>
              <GalleryDock items={dockItems} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Categories */}
      <section className="bg-white py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Explore ESell"
              title="Shop by category"
              action={
                <Link href="/categories" className="text-sm font-bold text-brand-black hover:text-amber-700">
                  View all categories <ArrowRight size={14} className="inline" />
                </Link>
              }
            />
          </Reveal>
          <Reveal stagger className="mt-8">
            {categories.length > 0 ? (
              <CategoryGrid categories={categories} />
            ) : (
              <p className="text-sm text-secondary-text">Categories will appear here once ESell adds them.</p>
            )}
          </Reveal>
        </Container>
      </section>

      {/* Featured products */}
      <section className="border-y border-[#eee7d4] bg-[#f7f5ef] py-16">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Handpicked for you"
              title="Featured Products"
              action={
                <Link href="/shop" className="text-sm font-bold text-brand-black hover:text-amber-700">
                  Browse marketplace <ArrowRight size={14} className="inline" />
                </Link>
              }
            />
          </Reveal>
          <Reveal stagger className="mt-8">
            <ProductGrid
              products={featured}
              favoriteIds={favoriteIds}
              emptyTitle="No featured products yet"
              emptyDescription="ESell hasn't marked any products as featured yet. Check back soon."
            />
          </Reveal>
        </Container>
      </section>

      {/* New arrivals */}
      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Just listed" title="New Arrivals" />
          </Reveal>
          <Reveal stagger className="mt-8">
            <ProductGrid
              products={newArrivals}
              favoriteIds={favoriteIds}
              emptyTitle="No new arrivals yet"
              emptyDescription="Newly published products will show up here."
            />
          </Reveal>
        </Container>
      </section>

      {/* Sell CTA */}
      <section className="relative overflow-hidden bg-brand-black py-16 text-white">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-brand-yellow lg:block" />
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <Reveal className="relative z-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-yellow">
              Have something to sell?
            </p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Give your goods a new beginning.
            </h2>
            <p className="mt-4 max-w-md text-sm text-gray-400">
              Tell us about your item. The ESell team reviews each request and contacts you before anything is
              listed.
            </p>
            <ButtonLink href="/sell" className="mt-6">
              Sell Your Goods <ArrowRight size={15} />
            </ButtonLink>
          </Reveal>
          <Reveal stagger className="relative z-10">
            <div className="flex flex-col gap-6 lg:py-4 lg:pl-8">
              {[
                { n: "01", title: "Submit", body: "Send us your item's details, photos and expected price." },
                { n: "02", title: "Review", body: "The ESell team checks it and may reach out for more details." },
                { n: "03", title: "List", body: "Once accepted, we publish it with a final price and photos." },
              ].map((step, i) => (
                <div key={step.n} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-black text-sm font-extrabold text-brand-yellow">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wider text-white lg:text-brand-black">
                      {step.title}
                    </p>
                    <p className="mt-0.5 max-w-xs text-xs font-semibold text-gray-400 lg:text-brand-black/70">
                      {step.body}
                    </p>
                  </div>
                  {i < 2 && <span className="sr-only">Then</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Trust */}
      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Why buy through ESell" title="Built around trust, not guesswork" />
          </Reveal>
          <Reveal stagger className="mt-8">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#e6ddc6] bg-[#e6ddc6] sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <ShieldCheck size={20} />, title: "Products reviewed by ESell", body: "Every listing is checked by our team before it reaches the marketplace." },
                { icon: <Users size={20} />, title: "Local Namibian support", body: "Based in Windhoek, with a team that understands buyers and sellers nationwide." },
                { icon: <MessageCircle size={20} />, title: "Easy product enquiries", body: "Reach ESell directly about any listing." },
                { icon: <Truck size={20} />, title: "Nationwide delivery options", body: "Delivery availability is shown on each listing before you enquire." },
              ].map((item) => (
                <div key={item.title} className="bg-[#fffdf7] p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow text-brand-black">
                    {item.icon}
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-brand-black">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-secondary-text">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
