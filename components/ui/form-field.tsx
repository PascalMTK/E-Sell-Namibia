import { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const fieldClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-brand-black placeholder-gray-400 transition focus:outline-none focus:border-brand-yellow-hover focus:ring-2 focus:ring-brand-yellow/30 disabled:bg-gray-50 disabled:text-gray-400";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-semibold text-brand-black", className)} {...props} />;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClasses, "min-h-[110px] resize-y", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClasses, "pr-8", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-secondary-text">{children}</p>;
}

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-brand-black accent-brand-yellow focus:ring-brand-yellow/40",
        className,
      )}
      {...props}
    />
  );
}
