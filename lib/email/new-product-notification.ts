import { prisma } from "@/lib/db/prisma";
import { getResendClient, EMAIL_FROM } from "@/lib/email/client";
import { formatNad } from "@/lib/utils/currency";

interface NotifiableProduct {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  location: string;
  images: { url: string; isCover: boolean }[];
}

function buildEmailHtml(product: NotifiableProduct, siteUrl: string, unsubscribeToken: string) {
  const cover = product.images.find((i) => i.isCover)?.url ?? product.images[0]?.url;
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8f9fa;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:20px 24px;">
        <span style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:6px 10px;border-radius:6px;">ESell Namibia</span>
      </div>
      ${cover ? `<img src="${cover}" alt="${product.name}" style="width:100%;height:260px;object-fit:cover;display:block;" />` : ""}
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8a6500;">New on ESell Namibia</p>
        <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#1a1a1a;">${product.name}</h1>
        <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1a1a1a;">${formatNad(product.price.toString())}</p>
        <p style="margin:0 0 20px;font-size:13px;color:#666666;">${product.location}</p>
        <a href="${productUrl}" style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:12px 22px;border-radius:8px;text-decoration:none;">View Product</a>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          You're receiving this because you have an ESell Namibia account.
          <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe from new product alerts</a>.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Emails every customer who opted in whenever a product becomes publicly visible.
 * No-ops (with a console note) when RESEND_API_KEY isn't configured, so this never
 * breaks product creation/publishing in environments without email set up.
 */
export async function notifyUsersOfNewProduct(product: NotifiableProduct) {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping new-product alert for "${product.name}".`);
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const recipients = await prisma.user.findMany({
    where: { role: "USER", receiveProductAlerts: true },
    select: { email: true, unsubscribeToken: true },
  });

  if (recipients.length === 0) return;

  const messages = recipients.map((r) => ({
    from: EMAIL_FROM,
    to: r.email,
    subject: `New on ESell Namibia: ${product.name}`,
    html: buildEmailHtml(product, siteUrl, r.unsubscribeToken),
  }));

  // Resend's batch endpoint accepts up to 100 emails per call.
  const BATCH_SIZE = 100;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      await resend.batch.send(batch);
    } catch (error) {
      console.error("[email] Failed to send new-product alert batch:", error);
    }
  }
}
