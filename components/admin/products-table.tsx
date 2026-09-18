"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Copy, Trash2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNad } from "@/lib/utils/currency";
import { PRODUCT_CONDITIONS, STOCK_STATUSES } from "@/lib/constants";
import {
  deleteProductAction,
  duplicateProductAction,
  markProductSoldAction,
  toggleProductPublishedAction,
} from "@/app/actions/admin/products";

interface Category {
  id: string;
  name: string;
}

interface ImageItem {
  id: string;
  url: string;
  isCover: boolean;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: string;
  condition: string;
  location: string;
  stockStatus: string;
  published: boolean;
  sold: boolean;
  createdAt: Date;
  images: ImageItem[];
  category: Category;
}

export function ProductsTable({ products, categories }: { products: ProductRow[]; categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/admin/products?${params.toString()}`));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParam("q", q)}
          onBlur={() => updateParam("q", q)}
          placeholder="Search products…"
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:border-brand-yellow-hover"
        />
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          defaultValue={searchParams.get("condition") ?? ""}
          onChange={(e) => updateParam("condition", e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All conditions</option>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${isPending ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-off-white text-xs uppercase tracking-wide text-secondary-text">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Condition</th>
              <th className="p-3">Location</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const cover = product.images.find((i) => i.isCover) ?? product.images[0];
              return (
                <tr key={product.id} className="hover:bg-off-white/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-off-white">
                        {cover && <Image src={cover.url} alt="" fill sizes="40px" className="object-cover" />}
                      </div>
                      <div>
                        <p className="line-clamp-1 font-semibold text-brand-black">{product.name}</p>
                        <p className="text-xs text-secondary-text">{product.sku || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-secondary-text">{product.category.name}</td>
                  <td className="p-3 font-bold text-brand-black">{formatNad(product.price)}</td>
                  <td className="p-3 text-secondary-text">
                    {PRODUCT_CONDITIONS.find((c) => c.value === product.condition)?.label}
                  </td>
                  <td className="p-3 text-secondary-text">{product.location}</td>
                  <td className="p-3 text-secondary-text">
                    {STOCK_STATUSES.find((s) => s.value === product.stockStatus)?.label}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={product.published ? "success" : "neutral"}>
                        {product.published ? "Published" : "Draft"}
                      </Badge>
                      {product.sold && <Badge variant="danger">Sold</Badge>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        aria-label="Edit product"
                        className="rounded-lg p-2 text-secondary-text hover:bg-off-white hover:text-brand-black"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        aria-label={product.published ? "Unpublish" : "Publish"}
                        onClick={() =>
                          startTransition(async () => {
                            await toggleProductPublishedAction(product.id, !product.published);
                            router.refresh();
                          })
                        }
                        className="rounded-lg p-2 text-secondary-text hover:bg-off-white hover:text-brand-black"
                      >
                        {product.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        aria-label="Mark sold"
                        onClick={() =>
                          startTransition(async () => {
                            await markProductSoldAction(product.id, !product.sold);
                            router.refresh();
                          })
                        }
                        className="rounded-lg p-2 text-secondary-text hover:bg-off-white hover:text-brand-black"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        aria-label="Duplicate product"
                        onClick={() =>
                          startTransition(async () => {
                            await duplicateProductAction(product.id);
                            router.refresh();
                          })
                        }
                        className="rounded-lg p-2 text-secondary-text hover:bg-off-white hover:text-brand-black"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        aria-label="Delete product"
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                            startTransition(async () => {
                              await deleteProductAction(product.id);
                              router.refresh();
                            });
                          }
                        }}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
