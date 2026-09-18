"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/form-field";
import { SELL_REQUEST_STATUSES } from "@/lib/constants";
import { updateSellRequestStatusAction } from "@/app/actions/admin/sell-requests";
import { useToast } from "@/components/ui/toast";

export function SellRequestStatusPanel({
  id,
  currentStatus,
  currentNotes,
}: {
  id: string;
  currentStatus: string;
  currentNotes: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(currentNotes ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateSellRequestStatusAction({ id, status, note });
      if (result.success) {
        showToast({ kind: "success", title: "Status updated" });
        router.refresh();
      } else {
        showToast({ kind: "error", title: "Could not update status", message: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {SELL_REQUEST_STATUSES.filter((s) => s.value !== "CONVERTED").map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="note">Admin Notes</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal notes about this request" />
      </div>
      <Button onClick={save} disabled={isPending}>
        {isPending ? "Saving…" : "Save Status"}
      </Button>
    </div>
  );
}
