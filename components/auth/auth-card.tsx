import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Container } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  variant = "default",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "default" | "showcase";
}) {
  if (variant === "showcase") {
    return (
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-[#f4f1e8] py-8 sm:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-brand-yellow" />
        <Container className="relative max-w-6xl">
          <div className="auth-panel-enter relative grid overflow-hidden rounded-2xl border border-[#e7dfca] bg-white shadow-[0_28px_80px_rgba(23,23,23,0.16)] md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <div className="relative flex flex-col px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="mb-10 flex items-center justify-between gap-4">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-black hover:text-[#8a6500]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow text-base font-black tracking-normal">E</span>
                  ESell Namibia
                </Link>
                <Link href="/" aria-label="Close and return to homepage" className="rounded-full p-2 text-secondary-text transition hover:bg-off-white hover:text-brand-black focus-visible:outline-2 focus-visible:outline-brand-yellow">
                  <X size={20} />
                </Link>
              </div>
              <div className="mb-8">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8a6500] before:h-0.5 before:w-6 before:bg-brand-yellow">Your ESell account</p>
                <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-brand-black sm:text-4xl">{title}<span className="text-brand-yellow">.</span></h1>
                {description && <p className="mt-3 max-w-sm text-sm leading-6 text-secondary-text">{description}</p>}
              </div>
              <div className="max-w-md flex-1">{children}</div>
              <Link href="/shop" className="mt-10 inline-flex items-center gap-2 self-start text-xs font-semibold text-secondary-text transition hover:text-brand-black">
                <ArrowLeft size={14} /> Back to the marketplace
              </Link>
            </div>

            <div className="auth-visual-enter relative hidden min-h-[620px] overflow-hidden bg-brand-black md:block">
              <Image
                src="https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1000&q=80"
                alt="A welcoming space for shopping and selling"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-deep-black via-brand-deep-black/30 to-transparent" />
              <div className="absolute right-0 top-10 bg-brand-yellow px-5 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-black">Buy • Sell • Discover</div>
              <div className="absolute inset-x-0 bottom-0 p-10 text-white lg:p-12">
                <span className="mb-5 block h-1 w-14 bg-brand-yellow" />
                <p className="max-w-sm text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">Good finds start here.</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">Explore quality goods across Namibia and keep your selling journey in one place.</p>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">Based in Windhoek · Nationwide delivery</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <Container className="flex max-w-md flex-col justify-center py-16">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-black">{title}</h1>
        {description && <p className="mt-2 text-sm text-secondary-text">{description}</p>}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </Container>
  );
}
