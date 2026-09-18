"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { adminLoginAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password" className="text-gray-300">
          Password
        </Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-400">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign In to Admin"}
      </Button>
    </form>
  );
}
