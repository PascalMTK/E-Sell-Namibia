"use client";

import { useEffect } from "react";
import { ButtonLink, Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-red-600">Something went wrong</p>
      <h1 className="text-3xl font-extrabold text-brand-black">We hit a snag</h1>
      <p className="mt-2 max-w-md text-sm text-secondary-text">
        Please try again. If the problem continues, contact ESell Namibia.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to homepage
        </ButtonLink>
      </div>
    </div>
  );
}
