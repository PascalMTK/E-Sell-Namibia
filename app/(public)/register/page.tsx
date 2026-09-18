import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <AuthCard title="Create your account" description="Track your Sell Requests and save your favorite listings.">
      <RegisterForm />
    </AuthCard>
  );
}
