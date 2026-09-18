"use client";

import { useActionState } from "react";
import { Input, Label, Textarea } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { updateSiteSettingsAction } from "@/app/actions/admin/settings";
import type { FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function SettingsForm({
  whatsappNumber,
  phoneNumber,
  email,
  address,
  businessHours,
}: {
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessHours: string;
}) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
        <Input id="whatsappNumber" name="whatsappNumber" placeholder="264811234567" defaultValue={whatsappNumber} />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input id="phoneNumber" name="phoneNumber" defaultValue={phoneNumber} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={address} />
      </div>
      <div>
        <Label htmlFor="businessHours">Business Hours</Label>
        <Textarea id="businessHours" name="businessHours" defaultValue={businessHours} />
      </div>
      {state?.success && <p className="text-sm font-semibold text-green-700">Settings saved.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
