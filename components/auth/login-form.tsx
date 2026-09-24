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
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="email" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
      </div>
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="password" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Enter your password" required autoComplete="current-password" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <div className="flex items-center justify-between text-xs">
        <Link href="/forgot-password" className="font-semibold text-brand-yellow-hover hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full py-3 font-bold" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign In"}
      </Button>
      <p className="pt-4 text-center text-xs text-secondary-text">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-yellow-hover hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
