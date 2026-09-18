import type { Metadata } from "next";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Admin · Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sellRequests: true, favorites: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Customers</h1>
        <p className="text-sm text-secondary-text">Registered ESell Namibia customers.</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="No customers yet" description="Registered customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-off-white text-xs uppercase tracking-wide text-secondary-text">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Sell Requests</th>
                <th className="p-3">Favorites</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="p-3 font-semibold text-brand-black">{customer.name}</td>
                  <td className="p-3 text-secondary-text">{customer.email}</td>
                  <td className="p-3 text-secondary-text">{customer.phone || "—"}</td>
                  <td className="p-3 text-secondary-text">{customer._count.sellRequests}</td>
                  <td className="p-3 text-secondary-text">{customer._count.favorites}</td>
                  <td className="p-3 text-secondary-text">{customer.createdAt.toLocaleDateString("en-NA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
