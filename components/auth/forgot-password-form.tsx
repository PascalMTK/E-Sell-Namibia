"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Label } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction } from "@/app/actions/password-reset";
import type { FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state?.success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-2 text-amber-600" size={28} />
        <p className="text-sm font-semibold text-brand-black">Check your email</p>
        <p className="mt-1 text-xs text-secondary-text">
          If an account exists for that email, we&rsquo;ve sent instructions to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send Reset Link"}
      </Button>
    </form>
  );
}
