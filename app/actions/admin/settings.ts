"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { siteSettingFormSchema } from "@/lib/validation/admin";
import type { FormState } from "@/app/actions/auth";

export async function updateSiteSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = siteSettingFormSchema.safeParse({
    whatsappNumber: formData.get("whatsappNumber"),
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
    address: formData.get("address"),
    businessHours: formData.get("businessHours"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  await prisma.adminActivity.create({
    data: { adminId: admin.id, type: "SETTINGS_UPDATED", description: "Updated site contact settings" },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/products", "layout");
  return { success: true };
}
