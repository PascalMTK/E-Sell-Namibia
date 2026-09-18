import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3h-2.9v12.3a2.9 2.9 0 1 1-2.05-2.77V9.4a5.95 5.95 0 1 0 4.95 5.87V9.2c1.02.8 2.28 1.28 3.65 1.32V7.6c-1.86-.1-3.5-1.1-3.65-4.6z" />
    </svg>
  );
}

function ThreadsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 21c-4.4 0-7.5-2.9-7.5-8.6C4.5 6.6 7.6 3.5 12 3.5s7.2 2.6 7.4 6.7c.1 2.4-.9 3.9-2.7 3.9-1.3 0-2.1-.7-2.3-1.8-.6 1.2-1.7 1.9-3.3 1.9-2 0-3.4-1.3-3.4-3.2 0-2 1.6-3.3 4-3.3.6 0 1.1.07 1.6.2 0-1.3-.7-2-2-2-1 0-1.7.4-2.2 1.1" />
    </svg>
  );
}

const SOCIAL_ICONS = [
  { href: SOCIAL_LINKS.facebook, label: "Visit E-Sell Namibia on Facebook", icon: <Facebook size={16} /> },
  { href: SOCIAL_LINKS.instagram, label: "Visit E-Sell Namibia on Instagram", icon: <Instagram size={16} /> },
  { href: SOCIAL_LINKS.tiktok, label: "Visit E-Sell Namibia on TikTok", icon: <TikTokIcon /> },
  { href: SOCIAL_LINKS.linkedin, label: "Visit E-Sell Namibia on LinkedIn", icon: <Linkedin size={16} /> },
  { href: SOCIAL_LINKS.threads, label: "Visit E-Sell Namibia on Threads", icon: <ThreadsIcon /> },
];

const columns = [
  {
    heading: "Marketplace",
    links: [
      { href: "/shop", label: "Shop" },
      { href: "/shop?category=electronics", label: "Electronics" },
      { href: "/shop?category=vehicles", label: "Cars" },
      { href: "/shop?category=furniture", label: "Furniture" },
      { href: "/shop?category=phones", label: "Phones" },
      { href: "/shop?category=computers", label: "Computers" },
      { href: "/sell", label: "Sell Your Goods" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/about#team", label: "Our Team" },
      { href: "/contact", label: "Contact Us" },
      { href: "/about#how-it-works", label: "How It Works" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/contact", label: "Contact Support" },
      { href: "/sell", label: "Sell With Us" },
      { href: "/about#delivery", label: "Delivery Information" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 items-center rounded-lg bg-white px-2.5 py-1.5">
                <Image src="/logo.png" alt="E-Sell" width={474} height={193} className="h-6 w-auto" />
              </span>
              <span className="text-lg font-extrabold uppercase tracking-widest">Namibia</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-400">
              Buying & Selling made easier for everyone. Buy new and second-hand goods, or sell your unwanted
              items through E-Sell Namibia.
            </p>
            <p className="mt-3 text-xs font-semibold text-gray-500">Windhoek, Namibia · Nationwide Delivery</p>

            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Follow E-Sell Namibia
              </p>
              <div className="flex gap-2.5">
                {SOCIAL_ICONS.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border bg-white/5 text-white transition hover:-translate-y-0.5 hover:bg-brand-yellow hover:text-brand-black"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-brand-yellow">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-brand-border pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} E-Sell Namibia. All rights reserved.</p>
          <p>Windhoek, Namibia · Nationwide Delivery</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-brand-yellow">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-yellow">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
