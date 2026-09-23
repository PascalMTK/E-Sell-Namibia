"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { confirmDpoReturnAction } from "@/app/actions/checkout";

type Status = "verifying" | "success" | "failed";

export function DpoReturnStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    confirmDpoReturnAction(orderId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("failed");
        setError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 size={32} className="animate-spin text-secondary-text" />
        <p className="text-sm font-semibold text-secondary-text">Verifying your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 size={40} className="text-green-600" />
        <div>
          <h1 className="text-xl font-extrabold text-brand-black">Payment received</h1>
          <p className="mt-1 text-sm text-secondary-text">Thank you — your order has been confirmed.</p>
        </div>
        <ButtonLink href={`/account/orders/${orderId}`}>View Order</ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <XCircle size={40} className="text-red-600" />
      <div>
        <h1 className="text-xl font-extrabold text-brand-black">Payment not completed</h1>
        <p className="mt-1 text-sm text-secondary-text">{error || "Your card payment could not be confirmed."}</p>
      </div>
      <ButtonLink href="/cart">Back to Cart</ButtonLink>
    </div>
  );
}
