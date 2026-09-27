/** A square crop in original image pixels, shared by the preview and export. */
export function portraitCrop(width: number, height: number, zoom: number, x: number, y: number) {
  const size = Math.min(width, height) / Math.max(1, Math.min(3, zoom));
  return {
    x: (width - size) * Math.max(0, Math.min(100, x)) / 100,
    y: (height - size) * Math.max(0, Math.min(100, y)) / 100,
    size,
  };
}
