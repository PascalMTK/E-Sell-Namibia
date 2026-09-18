import type { Metadata } from "next";
import { Container } from "@/components/ui/card";
import { SellRequestForm } from "@/components/sell/sell-request-form";
import { getActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Sell Your Goods" };
export const dynamic = "force-dynamic";

export default async function SellPage() {
  const categories = await getActiveCategories();

  return (
    <Container className="max-w-3xl py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700">Sell through E-Sell</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-black sm:text-4xl">
          Sell Your Goods Through E-Sell
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-secondary-text">
          Have something you no longer need? Send us the details and our E-Sell team will review your item and
          contact you.
        </p>
      </div>

      <SellRequestForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </Container>
  );
}
