import { put, del } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
  // Keep the local team editor usable before a Blob store is connected.
  if (folder === "team" && process.env.NODE_ENV === "development" && !process.env.BLOB_READ_WRITE_TOKEN) {
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${crypto.randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "uploads", "team");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return `/uploads/team/${filename}`;
  }
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
