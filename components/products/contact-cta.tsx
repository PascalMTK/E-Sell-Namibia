import { MessageCircle, Phone } from "lucide-react";
import { formatNad } from "@/lib/utils/currency";
import { buildProductWhatsappLink } from "@/lib/utils/whatsapp";
import { toTelHref } from "@/lib/utils/phone";

export function ProductContactCta({
  productName,
  price,
  whatsappNumber,
  phoneNumber,
}: {
  productName: string;
  price: string;
  whatsappNumber: string | null | undefined;
  phoneNumber: string | null | undefined;
}) {
  const whatsappLink = buildProductWhatsappLink({
    productName,
    price: formatNad(price),
    number: whatsappNumber,
  });

  if (!whatsappLink && !phoneNumber) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-off-white p-4 text-sm text-secondary-text">
        Product enquiries will be available once E-Sell connects its contact details.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      {phoneNumber && (
        <a
          href={toTelHref(phoneNumber)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-black px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-charcoal"
        >
          <Phone size={16} /> Contact E-Sell
        </a>
      )}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-brand-black transition hover:border-brand-black"
        >
          <MessageCircle size={16} /> WhatsApp E-Sell
        </a>
      )}
    </div>
  );
}
