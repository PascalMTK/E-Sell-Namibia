import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    // In local dev, Next's server-side image-optimizer fetch to remote hosts
    // can be unreliable on some machines/networks even when the browser can
    // reach the same URL directly. Skip optimization only in dev so broken
    // demo images don't block local work; production keeps full optimization.
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
