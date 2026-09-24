"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/app/actions/password-reset";
import type { FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (state?.success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-2 text-brand-yellow" size={28} />
        <p className="text-sm font-semibold text-brand-black">Password updated</p>
        <Link href="/login" className="mt-3 inline-block text-xs font-semibold text-brand-yellow-hover hover:underline">
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.confirmPassword} />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
