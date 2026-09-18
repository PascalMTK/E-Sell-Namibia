import type { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = { title: "Admin Login | ESell Namibia" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-deep-black px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 items-center rounded-xl bg-white px-3 py-2">
            <Image src="/logo.png" alt="ESell" width={474} height={193} className="h-8 w-auto" />
          </span>
          <h1 className="text-xl font-extrabold uppercase tracking-widest">Namibia Admin</h1>
          <p className="mt-1 text-xs text-gray-400">Moderation dashboard — authorized administrators only.</p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-brand-charcoal p-6 shadow-2xl">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
