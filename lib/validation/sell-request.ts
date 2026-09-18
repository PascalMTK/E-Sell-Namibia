import { z } from "zod";
import { productConditionEnum } from "@/lib/validation/product";

export const preferredContactMethodEnum = z.enum(["WHATSAPP", "PHONE", "EMAIL"]);

export const sellRequestCustomerSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  preferredContactMethod: preferredContactMethodEnum.default("WHATSAPP"),
});

export const sellRequestProductSchema = z.object({
  productName: z.string().min(2, "Item name is required"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  condition: productConditionEnum,
  description: z.string().min(10, "Please describe the item in a bit more detail"),
});

export const sellRequestPricingSchema = z.object({
  expectedPrice: z.coerce.number().positive().optional().nullable(),
  negotiable: z.boolean().default(true),
  location: z.string().min(2, "Location is required"),
});

export const sellRequestPhotosSchema = z.object({
  images: z
    .array(z.string().min(1))
    .min(1, "Add at least one photo")
    .max(8, "You can upload up to 8 photos"),
});

export const sellRequestFullSchema = sellRequestCustomerSchema
  .merge(sellRequestProductSchema)
  .merge(sellRequestPricingSchema)
  .merge(sellRequestPhotosSchema);

export type SellRequestFormValues = z.infer<typeof sellRequestFullSchema>;
