import type { Metadata } from "next";
import { AnnouncementManager } from "@/components/admin/announcement-manager";
import { getAllAnnouncementsForAdmin } from "@/lib/data/announcements";

export const metadata: Metadata = { title: "Admin · Announcements" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAllAnnouncementsForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Announcements</h1>
        <p className="text-sm text-secondary-text">Manage announcements shown on the public Announcements page.</p>
      </div>
      <AnnouncementManager announcements={announcements} />
    </div>
  );
}
