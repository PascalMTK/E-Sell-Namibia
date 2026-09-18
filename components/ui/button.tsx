import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variantClasses = {
  primary:
    "bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover hover:-translate-y-0.5 shadow-sm",
  secondary:
    "bg-white text-brand-black border border-gray-300 hover:bg-off-white hover:-translate-y-0.5",
  dark: "bg-brand-black text-white hover:bg-brand-charcoal hover:-translate-y-0.5",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-brand-black hover:bg-off-white",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
} as const;

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow-hover",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
