import { getResendClient, EMAIL_FROM } from "@/lib/email/client";
import { formatNad } from "@/lib/utils/currency";

interface ConfirmableOrder {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: { toString(): string };
  paymentMethod: string;
  items: { productNameSnapshot: string; quantity: number; lineTotal: { toString(): string } }[];
}

export async function sendOrderConfirmationEmail(order: ConfirmableOrder) {
  const resend = getResendClient();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — order confirmation for ${order.customerEmail}: ${order.orderNumber}`);
    return;
  }

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#1a1a1a;">${item.productNameSnapshot} &times; ${item.quantity}</td>
        <td style="padding:8px 0;font-size:13px;color:#1a1a1a;text-align:right;">${formatNad(item.lineTotal.toString())}</td>
      </tr>`,
    )
    .join("");

  const paymentNote =
    order.paymentMethod === "CASH_EFT"
      ? "Your order is reserved. Our team will contact you to confirm Cash/EFT payment."
      : "Your card payment has been received.";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8f9fa;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:20px 24px;">
        <span style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:6px 10px;border-radius:6px;">ESell Namibia</span>
      </div>
      <div style="padding:24px;">
        <h1 style="margin:0 0 8px;font-size:18px;color:#1a1a1a;">Thanks for your order, ${order.customerName}</h1>
        <p style="margin:0 0 16px;font-size:13px;color:#666666;">Order ${order.orderNumber}. ${paymentNote}</p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">
          ${itemRows}
          <tr>
            <td style="padding:12px 0 0;font-size:13px;font-weight:800;color:#1a1a1a;border-top:1px solid #e5e7eb;">Total</td>
            <td style="padding:12px 0 0;font-size:13px;font-weight:800;color:#1a1a1a;text-align:right;border-top:1px solid #e5e7eb;">${formatNad(order.total.toString())}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customerEmail,
      subject: `Order confirmation — ${order.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error("[email] Failed to send order confirmation email:", error);
  }
}
