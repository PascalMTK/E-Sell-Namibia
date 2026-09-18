import type { Metadata } from "next";
import { TeamManager } from "@/components/admin/team-manager";
import { getAllTeamMembersForAdmin } from "@/lib/data/team";

export const metadata: Metadata = { title: "Admin · Team" };
export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await getAllTeamMembersForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Team</h1>
        <p className="text-sm text-secondary-text">Manage the profiles shown on the About page.</p>
      </div>
      <TeamManager members={members} />
    </div>
  );
}
