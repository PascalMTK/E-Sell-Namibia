import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Truck, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { HeaderSearchBar, HeaderSearchForm } from "@/components/layout/search-form";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { AccountMenu } from "@/components/layout/account-menu";
import { NavLinks } from "@/components/layout/nav-links";
import { getCartItemCount } from "@/lib/data/cart";

const ICON_LINK = "relative flex h-10 w-10 items-center justify-center rounded-full text-brand-black transition hover:bg-off-white";

export async function Header() {
  const session = await auth();
  const cartCount = await getCartItemCount(session?.user?.id);

  return (
    <header className="sticky top-0 z-30 border-b border-brand-yellow/60 bg-white/95 shadow-[0_2px_0_rgba(217,144,0,0.12)] backdrop-blur">
      {/* Main row: logo · centered navigation · actions */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:h-18 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 justify-self-start sm:gap-2.5" aria-label="ESell Namibia home">
          <Image src="/logo.png" alt="ESell" width={474} height={193} className="h-8 w-auto sm:h-9" priority />
          <span className="text-sm font-extrabold uppercase tracking-widest text-brand-black sm:text-base">Namibia</span>
        </Link>

        <div className="hidden h-full min-w-0 lg:flex lg:flex-1 lg:justify-center xl:flex-none">
          <NavLinks />
        </div>

        <div className="flex shrink-0 items-center justify-self-end gap-0.5 sm:gap-1">
          <HeaderSearchForm className={`${ICON_LINK} md:hidden`} />
          <Link href="/account/favorites" aria-label="Favorites" title="Favorites" className={`${ICON_LINK} hidden sm:flex`}>
            <Heart size={19} />
          </Link>
          <Link href="/cart" aria-label={`Cart (${cartCount} items)`} title="Cart" className={ICON_LINK}>
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-extrabold text-brand-black ring-2 ring-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block">
            {session?.user ? (
              <AccountMenu name={session.user.name ?? session.user.email ?? "Account"} />
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-brand-black transition hover:bg-off-white"
              >
                <User size={19} />
                <span className="hidden 2xl:inline">Login</span>
              </Link>
            )}
          </div>

          <ButtonLink href="/sell" size="md" className="ml-2 hidden rounded-full whitespace-nowrap lg:inline-flex">
            Sell Your Goods
          </ButtonLink>

          <MobileMenu isAuthenticated={Boolean(session?.user)} />
        </div>
      </div>

      {/* Search row (tablet & desktop) */}
      <div className="hidden border-t border-gray-100 bg-off-white/60 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-2.5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)] lg:px-8">
          <span aria-hidden="true" className="hidden lg:block" />
          <Suspense fallback={<div className="h-11 w-full max-w-2xl" />}>
            <HeaderSearchBar className="w-full max-w-2xl" />
          </Suspense>
          <p className="hidden items-center gap-2 whitespace-nowrap text-xs font-semibold text-secondary-text lg:flex lg:justify-self-end">
            <Truck size={15} className="text-brand-yellow" />
            Windhoek · Nationwide Delivery
          </p>
        </div>
      </div>
    </header>
  );
}
