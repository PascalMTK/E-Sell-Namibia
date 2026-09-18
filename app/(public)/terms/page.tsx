import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-12">
      <SectionHeading eyebrow="Legal" title="Terms & Conditions" />
      <div className="prose prose-sm mt-6 max-w-none text-secondary-text">
        <p>
          This page will be finalized by ESell Namibia with the platform&rsquo;s full terms of use. In the
          meantime: only ESell Namibia administrators publish products on this marketplace. Customers may
          submit a Sell Request describing goods they wish to sell; submitting a request does not guarantee the
          item will be listed. ESell reviews every request and contacts submitters directly.
        </p>
      </div>
    </Container>
  );
}
