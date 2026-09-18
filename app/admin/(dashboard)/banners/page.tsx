import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/banner-manager";
import { getAllBannersForAdmin } from "@/lib/data/banners";

export const metadata: Metadata = { title: "Admin · Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await getAllBannersForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Banners</h1>
        <p className="text-sm text-secondary-text">Manage homepage promotional banners.</p>
      </div>
      <BannerManager banners={banners} />
    </div>
  );
}
