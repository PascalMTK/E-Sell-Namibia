"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Crop, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { portraitCrop } from "@/lib/utils/portrait-crop";

export function TeamPhotoEditor({ photo, onChange, onEditingChange }: {
  photo: string;
  onChange: (url: string) => void;
  onEditingChange: (editing: boolean) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const objectUrl = useRef<string | null>(null);
  const drag = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const loaded = new window.Image();
    loaded.crossOrigin = "anonymous";
    loaded.onload = () => { if (!cancelled) setImage(loaded); };
    loaded.onerror = () => {
      if (!cancelled) setError("This photo could not be opened for editing. Choose the original file from your device.");
    };
    loaded.src = source;
    return () => { cancelled = true; };
  }, [source]);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!image || !context) return;
    const crop = portraitCrop(image.naturalWidth, image.naturalHeight, zoom, x, y);
    context.clearRect(0, 0, 512, 512);
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, 512, 512);
  }, [image, zoom, x, y]);

  function reset() { setZoom(1); setX(50); setY(50); }

  function begin(url: string) {
    setError("");
    setImage(null);
    reset();
    setSource(url);
    onEditingChange(true);
  }

  function cancel() {
    setSource(null);
    setImage(null);
    setError("");
    onEditingChange(false);
  }

  async function applyCrop() {
    if (!image || uploading) return;
    setUploading(true);
    setError("");
    try {
      const output = document.createElement("canvas");
      output.width = output.height = 800;
      const context = output.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the photo. Please try another browser.");
      const crop = portraitCrop(image.naturalWidth, image.naturalHeight, zoom, x, y);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 800, 800);
      context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, 800, 800);
      const blob = await new Promise<Blob>((resolve, reject) => {
        output.toBlob((result) => result ? resolve(result) : reject(new Error("Could not crop this photo.")), "image/jpeg", 0.92);
      });
      const data = new FormData();
      data.append("file", blob, "team-portrait.jpg");
      data.append("folder", "team");
      const response = await fetch("/api/uploads", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.success || !result.url) throw new Error(result.error || "Photo upload failed. Please try again.");
      onChange(result.url);
      cancel();
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === "SecurityError"
        ? "This image host does not allow cropping. Choose the original file from your device."
        : cause instanceof Error ? cause.message : "Could not save the crop. Please try again.");
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-off-white p-4">
      <input ref={input} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="sr-only" tabIndex={-1} aria-label="Choose team portrait"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE_BYTES) {
            setError("Choose a JPEG, PNG or WEBP photo, up to 8MB."); return;
          }
          if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
          objectUrl.current = URL.createObjectURL(file);
          begin(objectUrl.current);
        }} />
      {source ? (
        <>
          <div className="text-center">
            <p className="text-sm font-bold text-brand-black">Frame the face</p>
            <p className="mt-1 text-xs text-secondary-text">Drag the photo or use the sliders. This circle matches the team page.</p>
          </div>
          <div className="mx-auto aspect-square w-64 max-w-full overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-[0_0_0_2px_#d99000]">
            <canvas ref={canvas} width={512} height={512} aria-label="Circular portrait crop preview"
              className="h-full w-full touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => {
                if (!image || uploading) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, y: event.clientY, cropX: x, cropY: y };
              }}
              onPointerMove={(event) => {
                if (!drag.current || !image || uploading) return;
                const crop = portraitCrop(image.naturalWidth, image.naturalHeight, zoom, x, y);
                const scale = crop.size / event.currentTarget.getBoundingClientRect().width;
                const clamp = (value: number) => Math.max(0, Math.min(100, value));
                if (image.naturalWidth > crop.size) setX(clamp(drag.current.cropX - (event.clientX - drag.current.x) * scale / (image.naturalWidth - crop.size) * 100));
                if (image.naturalHeight > crop.size) setY(clamp(drag.current.cropY - (event.clientY - drag.current.y) * scale / (image.naturalHeight - crop.size) * 100));
              }}
              onPointerUp={() => { drag.current = null; }}
              onPointerCancel={() => { drag.current = null; }}
              onLostPointerCapture={() => { drag.current = null; }} />
          </div>
          {!image && !error && <p role="status" className="text-center text-xs">Loading photo...</p>}
          <fieldset disabled={!image || uploading} className="space-y-3">
            {[
              { label: "Zoom", value: zoom, min: 1, max: 3, step: 0.01, change: setZoom, display: `${zoom.toFixed(2)}×` },
              { label: "Horizontal position", value: x, min: 0, max: 100, step: 1, change: setX, display: `${Math.round(x)}%` },
              { label: "Vertical position", value: y, min: 0, max: 100, step: 1, change: setY, display: `${Math.round(y)}%` },
            ].map((control, index) => (
              <div key={control.label}>
                <label htmlFor={`${id}-${index}`} className="flex justify-between text-xs font-semibold text-brand-black">{control.label}<span>{control.display}</span></label>
                <input id={`${id}-${index}`} type="range" min={control.min} max={control.max} step={control.step} value={control.value}
                  onChange={(event) => control.change(Number(event.target.value))} className="mt-1 min-h-6 w-full accent-brand-yellow-hover" />
              </div>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={applyCrop} disabled={!image || uploading}>{uploading ? "Uploading crop..." : "Apply crop"}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={reset} disabled={!image || uploading}><RotateCcw size={14} /> Reset</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel} disabled={uploading}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          {photo && <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2 border-brand-yellow"><Image src={photo} alt="Team portrait preview" fill sizes="128px" className="object-cover" /></div>}
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => input.current?.click()}><Upload size={14} />{photo ? "Replace photo" : "Choose photo"}</Button>
            {photo && <>
              <Button type="button" size="sm" variant="secondary" onClick={() => begin(photo)}><Crop size={14} /> Edit crop</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>Remove</Button>
            </>}
          </div>
          <p className="text-center text-xs text-secondary-text">JPEG, PNG or WEBP, up to 8MB. Save the member to publish your photo.</p>
        </>
      )}
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
