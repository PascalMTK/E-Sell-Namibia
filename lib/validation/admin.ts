import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  icon: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const bannerFormSchema = z.object({
  heading: z.string().min(2, "Heading is required"),
  subtitle: z.string().optional().or(z.literal("")),
  image: z.string().min(1, "Banner image is required"),
  ctaLabel: z.string().optional().or(z.literal("")),
  destination: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});
export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export const teamMemberFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().min(2, "Position is required"),
  bio: z.string().optional().or(z.literal("")),
  photo: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().default(true),
});
export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export const siteSettingFormSchema = z.object({
  whatsappNumber: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  businessHours: z.string().optional().or(z.literal("")),
});
export type SiteSettingFormValues = z.infer<typeof siteSettingFormSchema>;

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactMessageValues = z.infer<typeof contactMessageSchema>;

export const sellRequestStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "CONTACTED",
    "ACCEPTED",
    "REJECTED",
    "CONVERTED",
  ]),
  note: z.string().optional().or(z.literal("")),
});

export const orderStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"]),
  note: z.string().optional().or(z.literal("")),
});

export const announcementFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  body: z.string().min(2, "Body is required"),
  image: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  pinned: z.boolean().default(false),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
