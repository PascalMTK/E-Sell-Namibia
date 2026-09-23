import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { HeaderSearchForm } from "@/components/layout/search-form";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { AccountMenu } from "@/components/layout/account-menu";
import { getCartItemCount } from "@/lib/data/cart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/announcements", label: "Announcements" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const session = await auth();
  const cartCount = await getCartItemCount(session?.user?.id);

  return (
    <header className="sticky top-0 z-30 border-b border-brand-yellow bg-white/95 shadow-[0_2px_0_rgba(255,193,7,0.12)] backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:min-h-20 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="ESell Namibia home">
          <Image src="/logo.png" alt="ESell" width={474} height={193} className="h-8 w-auto sm:h-9" priority />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-widest text-brand-black uppercase sm:text-base">
              Namibia
            </span>
            <span className="hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-secondary-text sm:block">
              Windhoek · Nationwide Delivery
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center justify-center gap-5 xl:flex 2xl:gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-semibold text-brand-black/80 transition hover:text-brand-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <HeaderSearchForm className="hidden rounded-lg p-2 text-brand-black hover:bg-off-white sm:block" />
          <Link
            href="/account/favorites"
            aria-label="Favorites"
            className="hidden rounded-lg p-2 text-brand-black hover:bg-off-white sm:block"
          >
            <Heart size={18} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative hidden rounded-lg p-2 text-brand-black hover:bg-off-white sm:block"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-extrabold text-brand-black">
                {cartCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <AccountMenu name={session.user.name ?? session.user.email ?? "Account"} />
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-brand-black hover:bg-off-white sm:block"
            >
              Login
            </Link>
          )}

          <ButtonLink href="/sell" size="sm" className="hidden sm:inline-flex">
            Sell Your Goods
          </ButtonLink>

          <MobileMenu isAuthenticated={Boolean(session?.user)} />
        </div>
      </div>
    </header>
  );
}
