import Link from "next/link";
import { Container } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/permissions";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/sell-requests", label: "My Sell Requests" },
  { href: "/account/favorites", label: "Favorites" },
  { href: "/account/profile", label: "Profile" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <Container className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-brand-black hover:bg-off-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </Container>
  );
}
