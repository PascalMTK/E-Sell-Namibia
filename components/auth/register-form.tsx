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
    <form action={formAction} className="space-y-3.5">
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="name" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Full Name</Label>
        <Input id="name" name="name" placeholder="Your full name" required autoComplete="name" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
        <FieldError message={state?.fieldErrors?.name} />
      </div>
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="email" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
        <FieldError message={state?.fieldErrors?.email} />
      </div>
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="phone" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Phone <span className="font-medium normal-case tracking-normal text-secondary-text">(optional)</span></Label>
        <Input id="phone" name="phone" type="tel" placeholder="Your phone number" autoComplete="tel" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
      </div>
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="password" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Password</Label>
        <Input id="password" name="password" type="password" placeholder="At least 8 characters" minLength={8} required autoComplete="new-password" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
        <FieldError message={state?.fieldErrors?.password} />
      </div>
      <div className="rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20">
        <Label htmlFor="confirmPassword" className="mb-0 text-[10px] font-bold uppercase tracking-widest text-[#8a6500]">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat your password" required autoComplete="new-password" className="border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0" />
        <FieldError message={state?.fieldErrors?.confirmPassword} />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full py-3 font-bold" disabled={isPending}>
        {isPending ? "Creating account…" : "Create Account"}
      </Button>
      <p className="pt-4 text-center text-xs text-secondary-text">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
