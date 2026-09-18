import { z } from "zod";

export const productConditionEnum = z.enum([
  "NEW",
  "LIKE_NEW",
  "EXCELLENT",
  "GOOD",
  "USED",
  "REFURBISHED",
]);

export const stockStatusEnum = z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "SOLD"]);

export const productImageInput = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
  isCover: z.boolean().default(false),
});

export const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  shortDescription: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  sku: z.string().optional().or(z.literal("")),

  images: z.array(productImageInput).min(1, "At least one product image is required"),

  price: z.coerce.number().positive("Selling price must be greater than 0"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  negotiable: z.boolean().default(false),

  condition: productConditionEnum,

  location: z.string().refine((value) => value === "Windhoek", "Products must be located in Windhoek"),

  pickupAvailable: z.boolean().default(true),
  windhoekDelivery: z.boolean().default(false),
  nationwideDelivery: z.boolean().default(false),

  quantity: z.coerce.number().int().min(0).default(1),
  stockStatus: stockStatusEnum.default("IN_STOCK"),

  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  onSale: z.boolean().default(false),
  sold: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  delivery: z.string().optional(),
  sort: z.enum(["newest", "featured", "price-asc", "price-desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});
