"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { PRODUCT_CONDITIONS, SORT_OPTIONS } from "@/lib/constants";

interface CategoryOption {
  slug: string;
  name: string;
}

export function ShopFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/shop?${params.toString()}`));
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  function clearAll() {
    setQ("");
    startTransition(() => router.push("/shop"));
  }

  const activeCategory = searchParams.get("category") ?? "";
  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-yellow-hover"
        />
        <Button type="submit" size="md">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => updateParam("category", "")}
          className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
            activeCategory === "" ? "border-brand-black bg-brand-black text-white" : "border-gray-300 bg-white text-brand-black hover:border-brand-black"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateParam("category", cat.slug)}
            className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
              activeCategory === cat.slug
                ? "border-brand-black bg-brand-black text-white"
                : "border-gray-300 bg-white text-brand-black hover:border-brand-black"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Select
          defaultValue={searchParams.get("condition") ?? ""}
          onChange={(e) => updateParam("condition", e.target.value)}
          aria-label="Filter by condition"
        >
          <option value="">Any condition</option>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={searchParams.get("delivery") ?? ""}
          onChange={(e) => updateParam("delivery", e.target.value)}
          aria-label="Filter by delivery"
        >
          <option value="">Any delivery</option>
          <option value="pickup">Pickup Available</option>
          <option value="windhoek">Windhoek Delivery</option>
          <option value="nationwide">Nationwide Delivery</option>
        </Select>

        <input
          type="number"
          placeholder="Min price"
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-yellow-hover"
        />
        <input
          type="number"
          placeholder="Max price"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-yellow-hover"
        />

        <Select
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="text-xs font-semibold text-amber-700 hover:underline">
          Clear all filters
        </button>
      )}
      {isPending && <p className="text-xs text-secondary-text">Updating results…</p>}
    </div>
  );
}
