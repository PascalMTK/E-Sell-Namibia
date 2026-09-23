export const PRODUCT_CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" },
] as const;

export const STOCK_STATUSES = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "SOLD", label: "Sold" },
] as const;

export const SELL_REQUEST_STATUSES = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CONVERTED", label: "Converted to Product" },
] as const;

export const PREFERRED_CONTACT_METHODS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Phone" },
  { value: "EMAIL", label: "Email" },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/Esellnamibia/",
  instagram: "https://www.instagram.com/esellnamibia/?hl=en",
  tiktok: "https://www.tiktok.com/@e.sell.namibia",
  linkedin: "https://na.linkedin.com/company/esell-namibia",
  threads: "https://www.threads.com/@esellnamibia",
} as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export const ORDER_STATUSES = [
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
] as const;

export const PAYMENT_METHODS = [
  { value: "CASH_EFT", label: "Cash / EFT" },
  { value: "CARD_DPO", label: "Pay by Card" },
] as const;

export const MAX_SELL_REQUEST_IMAGES = 8;
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
