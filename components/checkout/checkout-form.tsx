"use client";

import { useState, useTransition } from "react";
import { Truck, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { placeOrderAction } from "@/app/actions/checkout";

const DELIVERY_METHODS = ["Pickup", "Windhoek Delivery", "Nationwide Delivery"];

export function CheckoutForm({ dpoAvailable }: { dpoAvailable: boolean }) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH_EFT" | "CARD_DPO">("CASH_EFT");
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_METHODS[0]);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      paymentMethod,
      deliveryMethod,
      deliveryAddress: String(form.get("deliveryAddress") || ""),
      notes: String(form.get("notes") || ""),
    };

    startTransition(async () => {
      const result = await placeOrderAction(payload);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      showToast({ kind: "error", title: "Could not place order", message: result.error });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-black">
          <Truck size={16} /> Delivery
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deliveryMethod">Delivery Method</Label>
            <Select id="deliveryMethod" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
              {DELIVERY_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>
          {deliveryMethod !== "Pickup" && (
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input id="deliveryAddress" name="deliveryAddress" placeholder="Street, suburb, city" />
            </div>
          )}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Anything ESell should know about your order" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-brand-black">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3.5 has-[:checked]:border-brand-yellow-hover has-[:checked]:bg-[#fff9e8]">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "CASH_EFT"}
              onChange={() => setPaymentMethod("CASH_EFT")}
              className="accent-brand-yellow"
            />
            <Banknote size={16} className="text-secondary-text" />
            <div>
              <p className="text-sm font-bold text-brand-black">Cash / EFT</p>
              <p className="text-xs text-secondary-text">Place your order now — ESell will contact you to confirm payment.</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 rounded-lg border border-gray-200 p-3.5 ${dpoAvailable ? "cursor-pointer has-[:checked]:border-brand-yellow-hover has-[:checked]:bg-[#fff9e8]" : "cursor-not-allowed opacity-50"}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              disabled={!dpoAvailable}
              checked={paymentMethod === "CARD_DPO"}
              onChange={() => setPaymentMethod("CARD_DPO")}
              className="accent-brand-yellow"
            />
            <CreditCard size={16} className="text-secondary-text" />
            <div>
              <p className="text-sm font-bold text-brand-black">Pay by Card</p>
              <p className="text-xs text-secondary-text">
                {dpoAvailable ? "Pay securely via DPO." : "Card payments are temporarily unavailable — please choose Cash/EFT."}
              </p>
            </div>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Placing Order…" : "Place Order"}
      </Button>
    </form>
  );
}
