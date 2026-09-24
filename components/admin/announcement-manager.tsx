"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Pin } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Checkbox } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { PhotoUploader } from "@/components/sell/photo-uploader";
import { useToast } from "@/components/ui/toast";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementActiveAction,
  togglePinnedAction,
} from "@/app/actions/admin/announcements";

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  image: string | null;
  active: boolean;
  pinned: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function AnnouncementManager({ announcements }: { announcements: AnnouncementRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [image, setImage] = useState("");

  function openCreate() {
    setEditing(null);
    setImage("");
    setShowDialog(true);
  }

  function openEdit(announcement: AnnouncementRow) {
    setEditing(announcement);
    setImage(announcement.image ?? "");
    setShowDialog(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      body: String(form.get("body") || ""),
      image,
      active: form.get("active") === "on",
      pinned: form.get("pinned") === "on",
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
    };

    const result = editing
      ? await updateAnnouncementAction(editing.id, payload)
      : await createAnnouncementAction(payload);
    if (result.success) {
      showToast({ kind: "success", title: editing ? "Announcement updated" : "Announcement created" });
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
          <Plus size={16} /> Add Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {announcement.image && (
              <div className="relative h-32 bg-off-white">
                <Image src={announcement.image} alt="" fill sizes="400px" className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-brand-black">{announcement.title}</p>
                {announcement.pinned && <Pin size={14} className="mt-0.5 shrink-0 text-brand-yellow" />}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-secondary-text">{announcement.body}</p>
              <div className="mt-2">
                <Badge variant={announcement.active ? "success" : "neutral"}>
                  {announcement.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await toggleAnnouncementActiveAction(announcement.id, !announcement.active);
                      router.refresh();
                    })
                  }
                  className="text-xs font-semibold text-secondary-text hover:underline"
                >
                  {announcement.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await togglePinnedAction(announcement.id, !announcement.pinned);
                      router.refresh();
                    })
                  }
                  className="text-xs font-semibold text-secondary-text hover:underline"
                >
                  {announcement.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() => openEdit(announcement)}
                  aria-label="Edit"
                  className="ml-auto rounded-lg p-1.5 text-secondary-text hover:bg-off-white hover:text-brand-black"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete announcement "${announcement.title}"?`)) {
                      startTransition(async () => {
                        await deleteAnnouncementAction(announcement.id);
                        router.refresh();
                      });
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

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Announcement" : "Add Announcement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Image</Label>
            <PhotoUploader
              images={image ? [{ url: image }] : []}
              onChange={(imgs) => setImage(imgs[0]?.url ?? "")}
              folder="announcements"
              maxImages={1}
            />
          </div>
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required defaultValue={editing?.title} />
          </div>
          <div>
            <Label htmlFor="body">Body *</Label>
            <Textarea id="body" name="body" required defaultValue={editing?.body} />
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
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox name="active" defaultChecked={editing?.active ?? true} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <Checkbox name="pinned" defaultChecked={editing?.pinned ?? false} />
              Pinned
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {editing ? "Save Changes" : "Create Announcement"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
