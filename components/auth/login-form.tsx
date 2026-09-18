"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { loginAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function LoginForm({ redirectTo = "/account" }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <div className="flex items-center justify-between text-xs">
        <Link href="/forgot-password" className="font-semibold text-amber-700 hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-center text-xs text-secondary-text">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="font-semibold text-amber-700 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
