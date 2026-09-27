"use server";

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validation/auth";
import { isEmailConfigured } from "@/lib/email/client";
import { isAdminEmail } from "@/lib/auth/admin-credentials";
import { sendRegistrationOtpEmail } from "@/lib/email/registration-otp";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  /** Set once a verification code has been emailed; the form then asks for the code. */
  pendingEmail?: string;
  notice?: string;
}

const OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Generates a fresh code for a pending sign-up and emails it. */
async function issueRegistrationCode(email: string, name: string): Promise<string | null> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.pendingRegistration.update({
    where: { email },
    data: {
      codeHash: await bcrypt.hash(code, 10),
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      lastSentAt: new Date(),
    },
  });

  const sent = await sendRegistrationOtpEmail(email, name, code, OTP_TTL_MINUTES);
  // Without SMTP in development the code is printed to the server console instead.
  if (!sent && (isEmailConfigured() || process.env.NODE_ENV === "production")) {
    return "We couldn't send the verification email. Please try again in a moment.";
  }
  return null;
}

function secondsUntilResend(lastSentAt: Date) {
  return Math.ceil((lastSentAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
}

/** Step 1 of sign-up: validate the details and email a 6-digit confirmation code. */
export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing || isAdminEmail(email)) {
    return { error: "An account with this email already exists." };
  }

  const details = {
    name,
    phone: parsed.data.phone || null,
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
  };
  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });

  if (pending && secondsUntilResend(pending.lastSentAt) > 0 && pending.expiresAt > new Date()) {
    // A code was just sent: keep it valid, but save any corrected details.
    await prisma.pendingRegistration.update({ where: { email }, data: details });
    return { pendingEmail: email, notice: "We already sent you a code. Check your inbox (and spam folder)." };
  }

  await prisma.pendingRegistration.upsert({
    where: { email },
    create: { email, ...details, codeHash: "", expiresAt: new Date() },
    update: details,
  });

  const sendError = await issueRegistrationCode(email, name);
  if (sendError) return { error: sendError };

  return { pendingEmail: email, notice: `We sent a 6-digit code to ${email}.` };
}

/** Step 2 of sign-up: check the emailed code, then create the account and sign in. */
export async function verifyRegistrationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");

  const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
  if (!pending) {
    return { error: "This sign-up has expired. Please fill in the form again." };
  }
  if (code.length !== 6) {
    return { pendingEmail: email, fieldErrors: { code: "Enter the 6-digit code from your email." } };
  }
  if (pending.expiresAt < new Date()) {
    return { pendingEmail: email, fieldErrors: { code: "This code has expired. Send a new one." } };
  }
  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    return { pendingEmail: email, fieldErrors: { code: "Too many wrong attempts. Send a new code." } };
  }

  if (!(await bcrypt.compare(code, pending.codeHash))) {
    const { attempts } = await prisma.pendingRegistration.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    const left = OTP_MAX_ATTEMPTS - attempts;
    return {
      pendingEmail: email,
      fieldErrors: { code: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many wrong attempts. Send a new code." },
    };
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    await prisma.pendingRegistration.delete({ where: { email } });
    return { error: "An account with this email already exists. Please log in." };
  }

  await prisma.$transaction([
    prisma.user.create({
      data: { name: pending.name, email, phone: pending.phone, passwordHash: pending.passwordHash, role: "USER" },
    }),
    prisma.pendingRegistration.delete({ where: { email } }),
  ]);

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) return { error: "Your email is confirmed. Please log in." };
    throw error;
  }

  return {};
}

/** Emails a new code for a pending sign-up, respecting the resend cooldown. */
export async function resendRegistrationCodeAction(email: string): Promise<FormState> {
  const normalized = email.trim().toLowerCase();
  const pending = await prisma.pendingRegistration.findUnique({ where: { email: normalized } });
  if (!pending) {
    return { error: "This sign-up has expired. Please fill in the form again." };
  }

  const wait = secondsUntilResend(pending.lastSentAt);
  if (wait > 0) {
    return { pendingEmail: normalized, error: `Please wait ${wait}s before requesting a new code.` };
  }

  const sendError = await issueRegistrationCode(normalized, pending.name);
  if (sendError) return { pendingEmail: normalized, error: sendError };
  return { pendingEmail: normalized, notice: `A new code was sent to ${normalized}.` };
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: String(formData.get("redirectTo") || "/account"),
    });
    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
}

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAdminEmail(email)) {
    return { error: "Invalid administrator credentials." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) return { error: "Invalid administrator credentials." };
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function adminSignOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
