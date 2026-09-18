/** Builds a valid `tel:` href from a human-readable phone number, keeping a leading `+`. */
export function toTelHref(phoneNumber: string): string {
  const digits = phoneNumber.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}
