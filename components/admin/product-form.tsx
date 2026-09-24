"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea, Select, Label, FieldError, Checkbox, HelpText } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhotoUploader } from "@/components/sell/photo-uploader";
import { PRODUCT_CONDITIONS, STOCK_STATUSES } from "@/lib/constants";
import { calculateDiscountPercent, formatNad } from "@/lib/utils/currency";
import { productFormSchema, ProductFormValues } from "@/lib/validation/product";
import { useToast } from "@/components/ui/toast";
import { createProductAction, updateProductAction } from "@/app/actions/admin/products";

interface CategoryOption {
  id: string;
  name: string;
}

export function ProductForm({
  categories,
  productId,
  defaultValues,
  sourceSellRequestId,
}: {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
  sourceSellRequestId?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      negotiable: false,
      pickupAvailable: true,
      windhoekDelivery: false,
      nationwideDelivery: false,
      quantity: 1,
      stockStatus: "IN_STOCK",
      published: false,
      featured: false,
      newArrival: false,
      onSale: false,
      sold: false,
      images: [],
      ...defaultValues,
      location: "Windhoek",
    },
  });

  const images = watch("images") || [];
  const price = watch("price");
  const originalPrice = watch("originalPrice");
  const discount = calculateDiscountPercent(price || 0, originalPrice || undefined);

  async function onSubmit(data: ProductFormValues) {
    setSubmitting(true);
    setServerError(null);
    const result = productId
      ? await updateProductAction(productId, data)
      : await createProductAction(data, sourceSellRequestId);
    setSubmitting(false);

    if (result.success) {
      showToast({
        kind: "success",
        title: productId ? "Product updated" : "Product created",
        message: data.published ? "The product is now live on the marketplace." : "Saved as draft.",
      });
      router.push("/admin/products");
      router.refresh();
    } else {
      setServerError(result.error || "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input id="shortDescription" {...register("shortDescription")} maxLength={200} />
            </div>
            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea id="description" rows={6} {...register("description")} />
              <FieldError message={errors.description?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select id="categoryId" {...register("categoryId")}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.categoryId?.message} />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register("brand")} />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" {...register("model")} />
              </div>
            </div>
            <div>
              <Label htmlFor="sku">SKU / Reference</Label>
              <Input id="sku" {...register("sku")} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Images</h2>
          <PhotoUploader
            images={images}
            onChange={(imgs) =>
              setValue(
                "images",
                imgs.map((img) => ({ url: img.url, isCover: img.isCover ?? false })),
                { shouldValidate: true },
              )
            }
            folder="products"
            showCoverSelection
          />
          <FieldError message={errors.images?.message as string | undefined} />
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Pricing</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Selling Price (N$) *</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              <FieldError message={errors.price?.message} />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (N$)</Label>
              <Input id="originalPrice" type="number" step="0.01" {...register("originalPrice")} />
            </div>
          </div>
          {discount && (
            <p className="mt-2 text-xs font-semibold text-brand-yellow-hover">
              Customers will see {formatNad(price || 0)} marked down {discount}% from {formatNad(originalPrice || 0)}.
            </p>
          )}
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-black">
            <Checkbox {...register("negotiable")} />
            Price is negotiable
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Condition & Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select id="condition" {...register("condition")}>
                <option value="">Select condition</option>
                {PRODUCT_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.condition?.message} />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input id="location" {...register("location")} readOnly className="bg-off-white" />
              <FieldError message={errors.location?.message} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Delivery</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("pickupAvailable")} /> Pickup Available
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("windhoekDelivery")} /> Windhoek Delivery
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("nationwideDelivery")} /> Nationwide Delivery
            </label>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Inventory</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={0} {...register("quantity")} />
            </div>
            <div>
              <Label htmlFor="stockStatus">Stock Status</Label>
              <Select id="stockStatus" {...register("stockStatus")}>
                {STOCK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-brand-black">Visibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("published")} /> Published
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("featured")} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("newArrival")} /> New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("onSale")} /> On Sale
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("sold")} /> Sold
            </label>
          </div>
          <HelpText>Only published products appear on the public marketplace.</HelpText>
        </Card>

        {serverError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{serverError}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
