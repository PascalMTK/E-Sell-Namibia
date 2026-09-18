"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { contactMessageSchema } from "@/lib/validation/admin";
import type { FormState } from "@/app/actions/auth";

export async function submitContactMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const session = await auth();
  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
      userId: session?.user?.id,
    },
  });

  return { success: true };
}
