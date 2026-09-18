"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { sellRequestFullSchema } from "@/lib/validation/sell-request";

export interface SellRequestActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createSellRequestAction(input: unknown): Promise<SellRequestActionState> {
  const parsed = sellRequestFullSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors, error: "Please check the highlighted fields." };
  }

  const session = await auth();
  const data = parsed.data;

  await prisma.sellRequest.create({
    data: {
      customerId: session?.user?.id,
      customerName: data.customerName,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      preferredContactMethod: data.preferredContactMethod,
      productName: data.productName,
      categoryId: data.categoryId,
      brand: data.brand || null,
      model: data.model || null,
      condition: data.condition,
      description: data.description,
      expectedPrice: data.expectedPrice ?? null,
      negotiable: data.negotiable,
      location: data.location,
      photos: {
        create: data.images.map((url, index) => ({ url, position: index })),
      },
      statusHistory: {
        create: [{ status: "SUBMITTED" }],
      },
    },
  });

  return { success: true };
}
