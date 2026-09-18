"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input, Label, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { registerAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
        <FieldError message={state?.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError message={state?.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.confirmPassword} />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create Account"}
      </Button>
      <p className="text-center text-xs text-secondary-text">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
