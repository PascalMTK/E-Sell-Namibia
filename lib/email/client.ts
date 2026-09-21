import { Resend } from "resend";

let client: Resend | null = null;

/** Returns null when RESEND_API_KEY isn't configured, so callers can no-op gracefully in dev. */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "ESell Namibia <onboarding@resend.dev>";
