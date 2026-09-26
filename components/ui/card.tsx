import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        className,
      )}
      {...props}
    />
  );
}

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-sm font-semibold text-[#8a6500]">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-black sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-sm text-secondary-text">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-off-white px-6 py-16 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-base font-bold text-brand-black">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-secondary-text">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}
