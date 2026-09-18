"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Checkbox } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { PhotoUploader } from "@/components/sell/photo-uploader";
import { useToast } from "@/components/ui/toast";
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  toggleBannerActiveAction,
} from "@/app/actions/admin/banners";

interface BannerRow {
  id: string;
  heading: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  destination: string | null;
  active: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [image, setImage] = useState("");

  function openCreate() {
    setEditing(null);
    setImage("");
    setShowDialog(true);
  }

  function openEdit(banner: BannerRow) {
    setEditing(banner);
    setImage(banner.image);
    setShowDialog(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      heading: String(form.get("heading") || ""),
      subtitle: String(form.get("subtitle") || ""),
      image,
      ctaLabel: String(form.get("ctaLabel") || ""),
      destination: String(form.get("destination") || ""),
      active: form.get("active") === "on",
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
    };

    const result = editing ? await updateBannerAction(editing.id, payload) : await createBannerAction(payload);
    if (result.success) {
      showToast({ kind: "success", title: editing ? "Banner updated" : "Banner created" });
      setShowDialog(false);
      router.refresh();
    } else {
      showToast({ kind: "error", title: "Error", message: result.error });
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="relative h-32 bg-off-white">
              <Image src={banner.image} alt="" fill sizes="400px" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="font-bold text-brand-black">{banner.heading}</p>
              {banner.subtitle && <p className="text-xs text-secondary-text">{banner.subtitle}</p>}
              <div className="mt-2">
                <Badge variant={banner.active ? "success" : "neutral"}>{banner.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startTransition(async () => { await toggleBannerActiveAction(banner.id, !banner.active); router.refresh(); })}
                  className="text-xs font-semibold text-secondary-text hover:underline"
                >
                  {banner.active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => openEdit(banner)} aria-label="Edit" className="ml-auto rounded-lg p-1.5 text-secondary-text hover:bg-off-white hover:text-brand-black">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete banner "${banner.heading}"?`)) {
                      startTransition(async () => { await deleteBannerAction(banner.id); router.refresh(); });
                    }
                  }}
                  aria-label="Delete"
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Banner" : "Add Banner"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Banner Image *</Label>
            <PhotoUploader
              images={image ? [{ url: image }] : []}
              onChange={(imgs) => setImage(imgs[0]?.url ?? "")}
              folder="banners"
              maxImages={1}
            />
          </div>
          <div>
            <Label htmlFor="heading">Heading *</Label>
            <Input id="heading" name="heading" required defaultValue={editing?.heading} />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" defaultValue={editing?.subtitle ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaLabel">CTA Label</Label>
              <Input id="ctaLabel" name="ctaLabel" defaultValue={editing?.ctaLabel ?? ""} />
            </div>
            <div>
              <Label htmlFor="destination">Destination URL</Label>
              <Input id="destination" name="destination" defaultValue={editing?.destination ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={toDateInputValue(editing?.startDate ?? null)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={toDateInputValue(editing?.endDate ?? null)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
            <Checkbox name="active" defaultChecked={editing?.active ?? true} />
            Active
          </label>
          <Button type="submit" className="w-full" disabled={isPending}>
            {editing ? "Save Changes" : "Create Banner"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
