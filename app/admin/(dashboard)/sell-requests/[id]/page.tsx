import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SellRequestStatusPanel } from "@/components/admin/sell-request-status-panel";
import { prisma } from "@/lib/db/prisma";
import { formatNad } from "@/lib/utils/currency";
import { PRODUCT_CONDITIONS, PREFERRED_CONTACT_METHODS } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin · Sell Request" };
export const dynamic = "force-dynamic";

export default async function AdminSellRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sellRequest = await prisma.sellRequest.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { position: "asc" } },
      category: true,
      customer: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      convertedProduct: true,
    },
  });

  if (!sellRequest) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black">{sellRequest.productName}</h1>
          <p className="text-sm text-secondary-text">Submitted {sellRequest.createdAt.toLocaleString("en-NA")}</p>
        </div>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Photos</h2>
          {sellRequest.photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {sellRequest.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-off-white">
                  <Image src={photo.url} alt="" fill sizes="150px" className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary-text">No photos were submitted.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Item Details</h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-secondary-text">Category</dt>
              <dd className="font-semibold text-brand-black">{sellRequest.category?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Condition</dt>
              <dd className="font-semibold text-brand-black">
                {PRODUCT_CONDITIONS.find((c) => c.value === sellRequest.condition)?.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Brand</dt>
              <dd className="font-semibold text-brand-black">{sellRequest.brand || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Model</dt>
              <dd className="font-semibold text-brand-black">{sellRequest.model || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Expected Price</dt>
              <dd className="font-semibold text-brand-black">
                {sellRequest.expectedPrice ? formatNad(sellRequest.expectedPrice.toString()) : "Not specified"}{" "}
                {sellRequest.negotiable && <span className="text-xs text-amber-700">(negotiable)</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-secondary-text">Location</dt>
              <dd className="flex items-center gap-1 font-semibold text-brand-black">
                <MapPin size={13} /> {sellRequest.location}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <p className="mb-1 text-xs text-secondary-text">Description</p>
            <p className="whitespace-pre-line text-sm text-brand-black">{sellRequest.description}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-bold text-brand-black">Status History</h2>
          <ul className="space-y-2 text-xs text-secondary-text">
            {sellRequest.statusHistory.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                <span className="font-semibold text-brand-black">{entry.status.replace("_", " ")}</span>
                <span>{entry.createdAt.toLocaleString("en-NA")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Customer</h2>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-brand-black">{sellRequest.customerName}</p>
            <a href={`tel:${sellRequest.phone}`} className="flex items-center gap-2 text-secondary-text hover:text-brand-black">
              <Phone size={14} /> {sellRequest.phone}
            </a>
            {sellRequest.whatsapp && (
              <a
                href={`https://wa.me/${sellRequest.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-secondary-text hover:text-brand-black"
              >
                <MessageCircle size={14} /> {sellRequest.whatsapp}
              </a>
            )}
            {sellRequest.email && (
              <a href={`mailto:${sellRequest.email}`} className="flex items-center gap-2 text-secondary-text hover:text-brand-black">
                <Mail size={14} /> {sellRequest.email}
              </a>
            )}
            <Badge variant="neutral">
              Prefers {PREFERRED_CONTACT_METHODS.find((m) => m.value === sellRequest.preferredContactMethod)?.label}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Review</h2>
          <SellRequestStatusPanel id={sellRequest.id} currentStatus={sellRequest.status} currentNotes={sellRequest.adminNotes} />
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-bold text-brand-black">Convert to Product</h2>
          {sellRequest.convertedProduct ? (
            <ButtonLink href={`/admin/products/${sellRequest.convertedProduct.id}/edit`} variant="secondary" className="w-full">
              View Converted Product
            </ButtonLink>
          ) : (
            <>
              <p className="mb-3 text-xs text-secondary-text">
                Opens the product creation form pre-filled with this request&rsquo;s details.
              </p>
              <ButtonLink href={`/admin/sell-requests/${sellRequest.id}/convert`} className="w-full">
                Convert to Product
              </ButtonLink>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
