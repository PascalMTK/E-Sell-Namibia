import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export const EMAIL_FROM = process.env.EMAIL_FROM || `ESell Namibia <${process.env.SMTP_USER ?? "no-reply@esell.na"}>`;

/** True when SMTP_HOST, SMTP_USER and SMTP_PASS are configured. */
export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Pooled SMTP transport, or null when SMTP isn't configured so callers can no-op gracefully in dev. */
function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // Port 465 uses implicit TLS; 587/25 upgrade with STARTTLS.
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }
  return transporter;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends one email over SMTP. Returns false (and logs) when SMTP isn't configured or
 * the send fails — email must never break the action that triggered it.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const smtp = getTransporter();
  if (!smtp) {
    console.log(`[email] SMTP not configured — skipped "${message.subject}" to ${message.to}.${message.text ? `\n${message.text}` : ""}`);
    return false;
  }
  try {
    await smtp.sendMail({ from: EMAIL_FROM, ...message });
    return true;
  } catch (error) {
    console.error(`[email] Failed to send "${message.subject}" to ${message.to}:`, error);
    return false;
  }
}

/** Shared branded wrapper so every ESell email looks the same. */
export function emailLayout(body: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8f9fa;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#1a1a1a;padding:20px 24px;">
        <span style="display:inline-block;background:#d99000;color:#1a1a1a;font-weight:800;font-size:14px;padding:6px 10px;border-radius:6px;">ESell Namibia</span>
      </div>
      ${body}
    </div>
  </div>`;
}
