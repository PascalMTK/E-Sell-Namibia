import { Container } from "@/components/ui/card";

/** Decorative animated layer (floating gold orbs + drifting dot grid). Place inside a `relative` section. */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="hero-backdrop">
      <span className="hero-orb hero-orb-a" />
      <span className="hero-orb hero-orb-b" />
      <span className="hero-orb hero-orb-c" />
    </div>
  );
}

/** Animated header band for public pages (Announcements, Contact, About). */
export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  /** Trailing words of the title rendered in the brand gold. */
  highlight?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#eadcae] bg-[#fff9e8]">
      <HeroBackdrop />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-brand-yellow sm:w-3" />
      <Container className="relative flex items-center justify-between gap-8 py-14 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="hero-rise mb-4 inline-flex rounded-full border border-[#eadcae] bg-white/80 px-3.5 py-1 text-sm font-semibold text-[#8a6500]"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            {eyebrow}
          </p>
          <h1
            className="hero-rise text-4xl font-black leading-[1.05] tracking-[-0.045em] text-brand-black sm:text-5xl"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            {title} {highlight && <span className="text-brand-yellow">{highlight}</span>}
          </h1>
          {description && (
            <p
              className="hero-rise mt-5 max-w-xl text-base leading-7 text-[#514c3f]"
              style={{ "--d": "260ms" } as React.CSSProperties}
            >
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="hero-icon hidden h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-brand-black text-brand-yellow shadow-[10px_10px_0_var(--color-brand-yellow)] md:flex">
            {icon}
          </div>
        )}
      </Container>
    </section>
  );
}
