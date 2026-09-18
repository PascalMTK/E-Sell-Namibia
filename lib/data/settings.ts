import { prisma } from "@/lib/db/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (settings) return settings;

  return prisma.siteSetting.create({
    data: {
      id: "singleton",
      whatsappNumber: process.env.NEXT_PUBLIC_ESELL_WHATSAPP_NUMBER || null,
      phoneNumber: process.env.NEXT_PUBLIC_ESELL_PHONE_NUMBER || null,
      email: process.env.NEXT_PUBLIC_ESELL_EMAIL || null,
    },
  });
}
