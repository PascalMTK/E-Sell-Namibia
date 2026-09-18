import { Container } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="flex max-w-md flex-col justify-center py-16">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-black">{title}</h1>
        {description && <p className="mt-2 text-sm text-secondary-text">{description}</p>}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </Container>
  );
}
