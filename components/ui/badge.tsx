import { cn } from "@/lib/utils/cn";

const variants = {
  yellow: "bg-brand-yellow/15 text-yellow-800 border-brand-yellow/40",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  dark: "bg-brand-black/5 text-brand-black border-brand-black/10",
} as const;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
