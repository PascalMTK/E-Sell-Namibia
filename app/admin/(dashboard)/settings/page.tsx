import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Admin · Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Settings</h1>
        <p className="text-sm text-secondary-text">
          Contact details used for the &ldquo;Contact ESell&rdquo; buttons and the Contact page.
        </p>
      </div>
      <Card className="p-6">
        <SettingsForm
          whatsappNumber={settings.whatsappNumber ?? ""}
          phoneNumber={settings.phoneNumber ?? ""}
          email={settings.email ?? ""}
          address={settings.address ?? ""}
          businessHours={settings.businessHours ?? ""}
        />
      </Card>
    </div>
  );
}
