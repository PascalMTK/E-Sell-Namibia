"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";

export interface UploadedImage {
  url: string;
  isCover?: boolean;
}

export function PhotoUploader({
  images,
  onChange,
  folder,
  maxImages = 8,
  showCoverSelection = false,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder: "products" | "sell-requests" | "team" | "banners" | "announcements";
  maxImages?: number;
  showCoverSelection?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);

    if (images.length + list.length > maxImages) {
      setError(`You can upload up to ${maxImages} photos.`);
      return;
    }

    for (const file of list) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG or WEBP images are allowed.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Each image must be 8MB or smaller.");
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Upload failed");
        uploaded.push({ url: json.url, isCover: images.length === 0 && uploaded.length === 0 });
      }
      onChange([...images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    const next = images.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((img) => img.isCover)) next[0].isCover = true;
    onChange(next);
  }

  function setCover(index: number) {
    onChange(images.map((img, i) => ({ ...img, isCover: i === index })));
  }

  function reorder(from: number, to: number) {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-off-white px-6 py-10 text-center transition hover:border-brand-yellow-hover"
      >
        {uploading ? <Loader2 className="animate-spin text-brand-yellow" size={24} /> : <UploadCloud className="text-brand-yellow" size={24} />}
        <p className="text-sm font-semibold text-brand-black">
          {uploading ? "Uploading…" : "Drag & drop photos, or click to browse"}
        </p>
        <p className="text-xs text-secondary-text">JPEG, PNG or WEBP. Up to {maxImages} photos, 8MB each.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2",
                img.isCover ? "border-brand-yellow-hover" : "border-gray-200",
              )}
            >
              <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
              {img.isCover && showCoverSelection && (
                <span className="absolute left-1 top-1 rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-black">
                  Cover Photo
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                {showCoverSelection && !img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    aria-label="Set as cover photo"
                    className="rounded p-1 text-white hover:text-brand-yellow"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove photo"
                  className="ml-auto rounded p-1 text-white hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
