import { requireAdmin } from "@/lib/auth/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [sellRequests, orders] = await Promise.all([
    prisma.sellRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAID"] } } }),
  ]);

  return (
    <div className="min-h-screen bg-[#f6f5f1] lg:flex">
      <AdminSidebar adminName={admin.name ?? admin.email ?? "Admin"} badges={{ sellRequests, orders }} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
