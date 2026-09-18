import { requireAdmin } from "@/lib/auth/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-off-white">
      <AdminSidebar adminName={admin.name ?? admin.email ?? "Admin"} />
      <main className="flex-1 overflow-x-hidden px-6 py-8 sm:px-8">{children}</main>
    </div>
  );
}
