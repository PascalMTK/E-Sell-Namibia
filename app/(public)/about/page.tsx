import type { Metadata } from "next";
import { CheckCircle2, MapPin, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { Container, SectionHeading, EmptyState } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { TeamCard } from "@/components/team/team-card";
import { getActiveTeamMembers } from "@/lib/data/team";

export const metadata: Metadata = { title: "About Us" };
export const dynamic = "force-dynamic";

const steps = [
  {
    icon: <PackageSearch size={20} />,
    title: "Discover",
    body: "Browse quality new and second-hand products reviewed by the ESell team.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "ESell reviews every listing",
    body: "Nothing reaches the marketplace without ESell checking it first — pictures, pricing and details.",
  },
  {
    icon: <Truck size={20} />,
    title: "Buy or sell with confidence",
    body: "Contact ESell about any listing, or submit your own goods for us to review and list on your behalf.",
  },
];

export default async function AboutPage() {
  const team = await getActiveTeamMembers();

  return (
    <>
      <PageHero
        eyebrow="About ESell Namibia"
        title="Namibia's buying and"
        highlight="selling platform."
        description="ESell Namibia connects buyers and sellers across the country, with every listing reviewed and managed by our team before it goes live."
        icon={<ShieldCheck size={44} />}
      />
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-off-white p-6">
            <h2 className="mb-2 text-sm font-bold text-brand-black">How buying works</h2>
            <p className="text-sm text-secondary-text">
              Browse listings on the marketplace, then contact ESell directly about any item you&rsquo;re
              interested in. ESell handles enquiries on behalf of the goods listed.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-off-white p-6">
            <h2 className="mb-2 text-sm font-bold text-brand-black">How selling works</h2>
            <p className="text-sm text-secondary-text">
              Submit a Sell Request with details and photos of your item. Our team reviews it, may contact you
              for more information, and — if accepted — creates the final marketplace listing.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-xs font-semibold text-secondary-text">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-brand-yellow" /> Based in Windhoek, Namibia
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck size={14} className="text-brand-yellow" /> Nationwide delivery options
          </span>
        </div>
      </Container>

      <section id="how-it-works" className="border-y border-gray-100 bg-off-white py-14">
        <Container>
          <SectionHeading eyebrow="Simple by design" title="Why ESell manages every listing" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow-hover">
                  {step.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-brand-black">{step.title}</h3>
                <p className="text-xs leading-relaxed text-secondary-text">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="team" className="py-14">
        <Container>
          <SectionHeading eyebrow="The people behind ESell" title="Meet the ESell Namibia team" />
          <div className="mt-8">
            {team.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((member) => (
                  <TeamCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CheckCircle2 size={32} />}
                title="Team profiles coming soon"
                description="ESell hasn't published team profiles yet."
              />
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-gray-100 bg-brand-black py-14 text-white">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-extrabold">Have something to sell?</h2>
          <p className="max-w-md text-sm text-gray-400">
            Submit your item for ESell to review — our team handles the rest.
          </p>
          <ButtonLink href="/sell">Sell Your Goods</ButtonLink>
        </Container>
      </section>
    </>
  );
}
