"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Textarea, Select, Label, FieldError, Checkbox, HelpText } from "@/components/ui/form-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { PhotoUploader, UploadedImage } from "@/components/sell/photo-uploader";
import { NAMIBIAN_LOCATIONS, PRODUCT_CONDITIONS, PREFERRED_CONTACT_METHODS } from "@/lib/constants";
import { formatNad } from "@/lib/utils/currency";
import { sellRequestFullSchema, SellRequestFormValues } from "@/lib/validation/sell-request";
import { createSellRequestAction } from "@/app/actions/sell-requests";

const STEPS = ["Your Details", "Item Details", "Price & Location", "Photos", "Preview"] as const;

const STEP_FIELDS: Record<number, (keyof SellRequestFormValues)[]> = {
  0: ["customerName", "phone", "whatsapp", "email", "preferredContactMethod"],
  1: ["productName", "categoryId", "brand", "model", "condition", "description"],
  2: ["expectedPrice", "negotiable", "location"],
  3: ["images"],
};

export function SellRequestForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SellRequestFormValues>({
    resolver: zodResolver(sellRequestFullSchema),
    defaultValues: {
      preferredContactMethod: "WHATSAPP",
      negotiable: true,
      images: [],
    },
  });

  const images = watch("images") || [];
  const values = watch();

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields ? await trigger(fields) : true;
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: SellRequestFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await createSellRequestAction(data);
    setIsSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow/15 text-amber-600">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-black">Thank you!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-secondary-text">
          Your item has been submitted to E-Sell Namibia for review. Our team will contact you after reviewing
          your information.
        </p>
        <ButtonLink href="/" className="mt-6">
          Back to homepage
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <ol className="mb-8 flex flex-wrap gap-2 text-xs font-semibold">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1.5 ${
              i === step ? "bg-brand-black text-white" : i < step ? "bg-brand-yellow/20 text-amber-700" : "bg-off-white text-secondary-text"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input id="customerName" {...register("customerName")} autoComplete="name" />
              <FieldError message={errors.customerName?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" {...register("phone")} autoComplete="tel" />
                <FieldError message={errors.phone?.message} />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" type="tel" {...register("whatsapp")} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} autoComplete="email" />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select id="preferredContactMethod" {...register("preferredContactMethod")}>
                {PREFERRED_CONTACT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input id="productName" {...register("productName")} />
              <FieldError message={errors.productName?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe your item and its condition" />
              <FieldError message={errors.description?.message} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expectedPrice">Expected Price (N$)</Label>
              <Input id="expectedPrice" type="number" min={0} {...register("expectedPrice")} />
              <HelpText>
                Your expected price is not necessarily the final E-Sell marketplace price. Our team will review
                the product before it is listed.
              </HelpText>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox {...register("negotiable")} defaultChecked />
              Price is negotiable
            </label>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Select id="location" {...register("location")}>
                <option value="">Select location</option>
                {NAMIBIAN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.location?.message} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>Photos *</Label>
            <PhotoUploader
              images={images.map((url) => ({ url }))}
              onChange={(imgs: UploadedImage[]) =>
                setValue(
                  "images",
                  imgs.map((i) => i.url),
                  { shouldValidate: true },
                )
              }
              folder="sell-requests"
            />
            <FieldError message={errors.images?.message as string | undefined} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-off-white p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-secondary-text">Name</p>
                <p className="font-semibold text-brand-black">{values.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Phone</p>
                <p className="font-semibold text-brand-black">{values.phone}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Item</p>
                <p className="font-semibold text-brand-black">{values.productName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Condition</p>
                <p className="font-semibold text-brand-black">{values.condition}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Expected Price</p>
                <p className="font-semibold text-brand-black">
                  {values.expectedPrice ? formatNad(values.expectedPrice) : "Not specified"}
                  {values.negotiable ? " (negotiable)" : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary-text">Location</p>
                <p className="font-semibold text-brand-black">{values.location}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-secondary-text">Photos ({images.length})</p>
              <div className="flex gap-2">
                {images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            </div>
            {submitError && <p className="font-semibold text-red-600">{submitError}</p>}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={goBack}>
              <ChevronLeft size={16} /> Back
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit Sell Request"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
