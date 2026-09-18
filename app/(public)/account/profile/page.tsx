import type { Metadata } from "next";
import { Card, SectionHeading } from "@/components/ui/card";
import { ProfileDetailsForm, ChangePasswordForm } from "@/components/account/profile-forms";
import { requireUser } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading title="Profile" description="Manage your personal details." />
        <Card className="mt-6 p-6">
          <ProfileDetailsForm name={user.name} phone={user.phone ?? ""} />
        </Card>
      </div>
      <div>
        <SectionHeading title="Settings" description="Update your password." />
        <Card className="mt-6 p-6">
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}
