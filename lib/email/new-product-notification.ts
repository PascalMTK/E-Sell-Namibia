import { prisma } from "@/lib/db/prisma";
import { emailLayout, isEmailConfigured, sendEmail } from "@/lib/email/client";
import { formatNad } from "@/lib/utils/currency";

interface NotifiableProduct {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string };
  location: string;
  images: { url: string; isCover: boolean }[];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function buildEmailHtml(product: NotifiableProduct, siteUrl: string, unsubscribeToken: string) {
  const coverPath = product.images.find((i) => i.isCover)?.url ?? product.images[0]?.url;
  const cover = coverPath?.startsWith("/") ? `${siteUrl}${coverPath}` : coverPath;
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;
  const name = escapeHtml(product.name);

  return emailLayout(`
      ${cover ? `<img src="${cover}" alt="${name}" style="width:100%;height:260px;object-fit:cover;display:block;" />` : ""}
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#8a6500;">New on ESell Namibia</p>
        <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#1a1a1a;">${name}</h1>
        <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1a1a1a;">${formatNad(product.price.toString())}</p>
        <p style="margin:0 0 20px;font-size:13px;color:#666666;">${escapeHtml(product.location)}</p>
        <a href="${productUrl}" style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:12px 22px;border-radius:8px;text-decoration:none;">View Product</a>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          You're receiving this because you have an ESell Namibia account.
          <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe from new product alerts</a>.
        </p>
      </div>`);
}

/**
 * Emails every customer who opted in whenever a product becomes publicly visible.
 * Each customer gets their own message (personal unsubscribe link) over the pooled
 * SMTP connection. No-ops when SMTP isn't configured, so product publishing never breaks.
 */
export async function notifyUsersOfNewProduct(product: NotifiableProduct) {
  if (!isEmailConfigured()) {
    console.log(`[email] SMTP not configured — skipping new-product alert for "${product.name}".`);
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const recipients = await prisma.user.findMany({
    where: { role: "USER", receiveProductAlerts: true },
    select: { email: true, unsubscribeToken: true },
  });

  // Send in small parallel groups so large customer lists don't overwhelm the SMTP server.
  const GROUP_SIZE = 5;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += GROUP_SIZE) {
    const results = await Promise.all(
      recipients.slice(i, i + GROUP_SIZE).map((r) =>
        sendEmail({
          to: r.email,
          subject: `New on ESell Namibia: ${product.name}`,
          html: buildEmailHtml(product, siteUrl, r.unsubscribeToken),
          text: `New on ESell Namibia: ${product.name} — ${formatNad(product.price.toString())}
${siteUrl}/products/${product.slug}`,
        }),
      ),
    );
    sent += results.filter(Boolean).length;
  }
  console.log(`[email] New-product alert "${product.name}" sent to ${sent}/${recipients.length} customers.`);
}
