import { put, del } from "@vercel/blob";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

export class UploadValidationError extends Error {}

export function assertValidImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadValidationError("Only JPEG, PNG or WEBP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new UploadValidationError("Each image must be 8MB or smaller.");
  }
}

/** Uploads an image to Vercel Blob storage under the given folder and returns its public URL. */
export async function uploadImage(file: File, folder: "products" | "sell-requests" | "team" | "banners" | "announcements") {
  assertValidImage(file);
  const key = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteImage(url: string) {
  try {
    await del(url);
  } catch {
    // Non-fatal: the referenced object may already be gone.
  }
}
