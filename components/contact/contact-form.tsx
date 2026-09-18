"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { submitContactMessageAction } from "@/app/actions/contact";
import type { FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessageAction, initialState);
  const submitted = Boolean(state?.success);

  if (submitted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-off-white p-6 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-amber-600" size={28} />
        <p className="text-sm font-bold text-brand-black">Message sent</p>
        <p className="mt-1 text-xs text-secondary-text">ESell Namibia will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required />
          <FieldError message={state?.fieldErrors?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError message={state?.fieldErrors?.email} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" required />
        <FieldError message={state?.fieldErrors?.message} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
