import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-700">404</p>
      <h1 className="text-3xl font-extrabold text-brand-black">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-secondary-text">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/">Back to homepage</ButtonLink>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-brand-black hover:bg-off-white"
        >
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}
