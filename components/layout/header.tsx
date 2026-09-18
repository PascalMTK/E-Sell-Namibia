import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { HeaderSearchForm } from "@/components/layout/search-form";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { AccountMenu } from "@/components/layout/account-menu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:min-h-20 lg:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="E-Sell Namibia home">
          <Image src="/logo.png" alt="E-Sell" width={474} height={193} className="h-8 w-auto sm:h-9" priority />
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
