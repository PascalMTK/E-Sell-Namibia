"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

export function ImageGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return <div className="aspect-square rounded-xl bg-off-white" />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-off-white">
        <Image
          src={active.url}
          alt={active.altText || productName}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === activeIndex}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                i === activeIndex ? "border-brand-yellow-hover" : "border-transparent",
              )}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
