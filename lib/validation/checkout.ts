import { z } from "zod";

export const checkoutFormSchema = z.object({
  paymentMethod: z.enum(["CASH_EFT", "CARD_DPO"]),
  deliveryMethod: z.string().optional().or(z.literal("")),
  deliveryAddress: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
