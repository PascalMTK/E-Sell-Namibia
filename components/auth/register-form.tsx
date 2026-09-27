"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Input, Label, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import {
  registerAction,
  resendRegistrationCodeAction,
  verifyRegistrationAction,
  type FormState,
} from "@/app/actions/auth";

const initialState: FormState = {};
const RESEND_COOLDOWN_SECONDS = 60;

const FIELD_BOX =
  "rounded-lg border border-gray-300 px-3.5 py-2 transition focus-within:border-brand-yellow-hover focus-within:ring-2 focus-within:ring-brand-yellow/20";
const FIELD_LABEL = "mb-0 text-xs font-semibold text-[#8a6500]";
const FIELD_INPUT = "border-0 bg-transparent px-0 py-1 shadow-none focus:border-0 focus:ring-0";

type Values = { name: string; email: string; phone: string; password: string; confirmPassword: string };
const EMPTY_VALUES: Values = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export function RegisterForm() {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [editing, setEditing] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const [registerState, registerFormAction, isRegistering] = useActionState(
    async (prev: FormState, formData: FormData) => {
      setValues(Object.fromEntries(Object.keys(EMPTY_VALUES).map((k) => [k, String(formData.get(k) ?? "")])) as Values);
      setEditing(false);
      const result = await registerAction(prev, formData);
      if (result.pendingEmail) setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      return result;
    },
    initialState,
  );

  const pendingEmail = !editing ? registerState.pendingEmail : undefined;

  if (pendingEmail) {
    return (
      <VerifyStep
        email={pendingEmail}
        password={values.password}
        notice={registerState.notice}
        cooldownUntil={cooldownUntil}
        onResent={() => setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)}
        onChangeEmail={() => setEditing(true)}
      />
    );
  }

  return (
    <form action={registerFormAction} className="space-y-3.5">
      <div className={FIELD_BOX}>
        <Label htmlFor="name" className={FIELD_LABEL}>Full name</Label>
        <Input id="name" name="name" defaultValue={values.name} placeholder="Your full name" required autoComplete="name" className={FIELD_INPUT} />
        <FieldError message={registerState.fieldErrors?.name} />
      </div>
      <div className={FIELD_BOX}>
        <Label htmlFor="email" className={FIELD_LABEL}>Email</Label>
        <Input id="email" name="email" type="email" defaultValue={values.email} placeholder="you@example.com" required autoComplete="email" className={FIELD_INPUT} />
        <FieldError message={registerState.fieldErrors?.email} />
      </div>
      <div className={FIELD_BOX}>
        <Label htmlFor="phone" className={FIELD_LABEL}>Phone <span className="font-medium text-secondary-text">(optional)</span></Label>
        <Input id="phone" name="phone" type="tel" defaultValue={values.phone} placeholder="Your phone number" autoComplete="tel" className={FIELD_INPUT} />
      </div>
      <div className={FIELD_BOX}>
        <Label htmlFor="password" className={FIELD_LABEL}>Password</Label>
        <Input id="password" name="password" type="password" defaultValue={values.password} placeholder="At least 8 characters" minLength={8} required autoComplete="new-password" className={FIELD_INPUT} />
        <FieldError message={registerState.fieldErrors?.password} />
      </div>
      <div className={FIELD_BOX}>
        <Label htmlFor="confirmPassword" className={FIELD_LABEL}>Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" defaultValue={values.confirmPassword} placeholder="Repeat your password" required autoComplete="new-password" className={FIELD_INPUT} />
        <FieldError message={registerState.fieldErrors?.confirmPassword} />
      </div>
      {registerState.error && <p className="text-sm font-semibold text-red-600">{registerState.error}</p>}
      <Button type="submit" className="w-full py-3 font-bold" disabled={isRegistering}>
        {isRegistering ? "Sending code…" : "Continue"}
      </Button>
      <p className="text-center text-xs text-secondary-text">We&apos;ll email you a 6-digit code to confirm your address.</p>
      <p className="pt-2 text-center text-xs text-secondary-text">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-yellow-hover hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function VerifyStep({
  email,
  password,
  notice,
  cooldownUntil,
  onResent,
  onChangeEmail,
}: {
  email: string;
  password: string;
  notice?: string;
  cooldownUntil: number;
  onResent: () => void;
  onChangeEmail: () => void;
}) {
  const [verifyState, verifyFormAction, isVerifying] = useActionState(verifyRegistrationAction, initialState);
  const [resendState, setResendState] = useState<FormState>({});
  const [isResending, startResend] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  function resend() {
    startResend(async () => {
      const result = await resendRegistrationCodeAction(email);
      setResendState(result);
      if (!result.error) {
        onResent();
        codeRef.current?.focus();
      }
    });
  }

  const message = resendState.notice ?? notice;
  const error = verifyState.error ?? resendState.error;

  return (
    <form action={verifyFormAction} className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[#eadcae] bg-[#fff9e8] p-4">
        <MailCheck size={22} className="mt-0.5 shrink-0 text-brand-yellow-hover" />
        <div className="text-sm">
          <p className="font-bold text-brand-black">Check your email</p>
          <p className="mt-0.5 text-secondary-text">{message ?? `We sent a 6-digit code to ${email}.`}</p>
        </div>
      </div>

      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="password" value={password} />

      <div>
        <Label htmlFor="code" className={FIELD_LABEL}>Verification code</Label>
        <Input
          ref={codeRef}
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="••••••"
          onChange={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
          className="mt-1 py-3 text-center text-2xl font-extrabold tracking-[0.5em] placeholder:tracking-[0.5em]"
        />
        <FieldError message={verifyState.fieldErrors?.code} />
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <Button type="submit" className="w-full py-3 font-bold" disabled={isVerifying}>
        {isVerifying ? "Checking…" : "Verify & create account"}
      </Button>

      <div className="flex items-center justify-between text-xs">
        <button type="button" onClick={onChangeEmail} className="font-semibold text-secondary-text hover:text-brand-black hover:underline">
          Change email
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={secondsLeft > 0 || isResending}
          className="font-semibold text-brand-yellow-hover hover:underline disabled:cursor-not-allowed disabled:text-secondary-text disabled:no-underline"
        >
          {isResending ? "Sending…" : secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
