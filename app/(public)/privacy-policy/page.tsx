import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <SectionHeading eyebrow="Legal" title="Privacy Policy" />
      <div className="prose prose-sm mt-6 max-w-none text-secondary-text">
        <p>
          This page will be finalized by E-Sell Namibia with the platform&rsquo;s full privacy policy. In the
          meantime: E-Sell Namibia collects the information you provide when creating an account, submitting a
          Sell Request, or contacting us, and uses it to operate the marketplace, review listings, and respond
          to enquiries. We do not sell your personal information to third parties.
        </p>
      </div>
    </Container>
  );
}
