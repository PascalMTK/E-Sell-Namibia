"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Checkbox } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { PhotoUploader } from "@/components/sell/photo-uploader";
import { useToast } from "@/components/ui/toast";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  toggleTeamMemberActiveAction,
} from "@/app/actions/admin/team";

interface TeamRow {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  twitter: string | null;
  email: string | null;
  active: boolean;
}

export function TeamManager({ members }: { members: TeamRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [photo, setPhoto] = useState<string>("");

  function openCreate() {
    setEditing(null);
    setPhoto("");
    setShowDialog(true);
  }

  function openEdit(member: TeamRow) {
    setEditing(member);
    setPhoto(member.photo ?? "");
    setShowDialog(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      position: String(form.get("position") || ""),
      bio: String(form.get("bio") || ""),
      photo,
      linkedin: String(form.get("linkedin") || ""),
      twitter: String(form.get("twitter") || ""),
      email: String(form.get("email") || ""),
      active: form.get("active") === "on",
    };

    const result = editing
      ? await updateTeamMemberAction(editing.id, payload)
      : await createTeamMemberAction(payload);

    if (result.success) {
      showToast({ kind: "success", title: editing ? "Team member updated" : "Team member added" });
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
          <Plus size={16} /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-off-white">
                {member.photo && <Image src={member.photo} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div>
                <p className="font-bold text-brand-black">{member.name}</p>
                <p className="text-xs text-secondary-text">{member.position}</p>
              </div>
            </div>
            <Badge variant={member.active ? "success" : "neutral"}>{member.active ? "Active" : "Inactive"}</Badge>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => startTransition(async () => { await toggleTeamMemberActiveAction(member.id, !member.active); router.refresh(); })}
                className="text-xs font-semibold text-secondary-text hover:underline"
              >
                {member.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => openEdit(member)} aria-label="Edit" className="ml-auto rounded-lg p-1.5 text-secondary-text hover:bg-off-white hover:text-brand-black">
                <Pencil size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Remove ${member.name}?`)) {
                    startTransition(async () => { await deleteTeamMemberAction(member.id); router.refresh(); });
                  }
                }}
                aria-label="Delete"
                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Team Member" : "Add Team Member"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Photo</Label>
            <PhotoUploader
              images={photo ? [{ url: photo }] : []}
              onChange={(imgs) => setPhoto(imgs[0]?.url ?? "")}
              folder="team"
              maxImages={1}
            />
          </div>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={editing?.name} />
          </div>
          <div>
            <Label htmlFor="position">Position *</Label>
            <Input id="position" name="position" required defaultValue={editing?.position} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={editing?.bio ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" name="linkedin" defaultValue={editing?.linkedin ?? ""} />
            </div>
            <div>
              <Label htmlFor="twitter">X / Twitter URL</Label>
              <Input id="twitter" name="twitter" defaultValue={editing?.twitter ?? ""} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={editing?.email ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
            <Checkbox name="active" defaultChecked={editing?.active ?? true} />
            Active
          </label>
          <Button type="submit" className="w-full" disabled={isPending}>
            {editing ? "Save Changes" : "Add Member"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
