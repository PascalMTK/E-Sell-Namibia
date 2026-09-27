import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The single administrator login lives only in server env (ADMIN_EMAIL / ADMIN_PASSWORD).
 * It is never stored in the database, so it can't be reset from the website —
 * change it by editing the env and restarting the server.
 */
export function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isAdminEmail(email: string) {
  const adminEmail = getAdminEmail();
  return adminEmail !== null && email.trim().toLowerCase() === adminEmail;
}

export function isAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare fixed-length digests so the check takes the same time whatever the input.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(expected));
}
