import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "E-Sell Namibia | Buying & Selling made easier for everyone",
    template: "%s | E-Sell Namibia",
  },
  description:
    "E-Sell Namibia is Namibia's buying and selling platform. Discover quality new and second-hand products, or submit your item for E-Sell to review and list.",
  icons: { icon: "/logo-mark.png" },
  openGraph: {
    title: "E-Sell Namibia",
    description: "Buying & Selling made easier for everyone.",
    url: siteUrl,
    siteName: "E-Sell Namibia",
    locale: "en_NA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white text-brand-black antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
