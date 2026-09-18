import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/contact-form";
import { LocationMap } from "@/components/contact/location-map";
import { getSiteSettings } from "@/lib/data/settings";
import { toTelHref } from "@/lib/utils/phone";

export const metadata: Metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const hasAnyDetail = settings.whatsappNumber || settings.phoneNumber || settings.email || settings.address;

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Let's connect"
        title="Questions? We're here to help"
        description="Ask about a product or learn how selling through E-Sell works."
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {settings.phoneNumber && (
            <a
              href={toTelHref(settings.phoneNumber)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-off-white p-4 hover:border-brand-black"
            >
              <Phone size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-secondary-text">Phone</p>
                <p className="text-sm font-bold text-brand-black">{settings.phoneNumber}</p>
              </div>
            </a>
          )}
          {settings.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-off-white p-4 hover:border-brand-black"
            >
              <MessageCircle size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-secondary-text">WhatsApp</p>
                <p className="text-sm font-bold text-brand-black">{settings.whatsappNumber}</p>
              </div>
            </a>
          )}
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-off-white p-4 hover:border-brand-black"
            >
              <Mail size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-secondary-text">Email</p>
                <p className="text-sm font-bold text-brand-black">{settings.email}</p>
              </div>
            </a>
          )}
          {settings.address && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-off-white p-4">
              <MapPin size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-secondary-text">Location</p>
                <p className="text-sm font-bold text-brand-black">{settings.address}</p>
              </div>
            </div>
          )}
          {settings.businessHours && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-off-white p-4">
              <Clock size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-secondary-text">Business Hours</p>
                <p className="text-sm font-bold text-brand-black">{settings.businessHours}</p>
              </div>
            </div>
          )}
          {!hasAnyDetail && (
            <p className="text-sm text-secondary-text">Contact details will appear here when E-Sell provides them.</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContactForm />
        </div>
      </div>

      {settings.address && (
        <div className="mt-10">
          <LocationMap address={settings.address} />
        </div>
      )}
    </Container>
  );
}
