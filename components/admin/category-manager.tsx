"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Checkbox } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  reorderCategoryAction,
} from "@/app/actions/admin/categories";

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  active: boolean;
  _count: { products: number };
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  function openCreate() {
    setEditing(null);
    setShowDialog(true);
  }

  function openEdit(category: CategoryRow) {
    setEditing(category);
    setShowDialog(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      icon: String(form.get("icon") || ""),
      description: String(form.get("description") || ""),
      active: form.get("active") === "on",
    };

    const result = editing ? await updateCategoryAction(editing.id, payload) : await createCategoryAction(payload);
    if (result.success) {
      showToast({ kind: "success", title: editing ? "Category updated" : "Category created" });
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
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-off-white text-xs uppercase tracking-wide text-secondary-text">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3">Products</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category, index) => (
              <tr key={category.id}>
                <td className="p-3">
                  <span className="mr-2">{category.icon}</span>
                  <span className="font-semibold text-brand-black">{category.name}</span>
                </td>
                <td className="p-3 text-secondary-text">{category._count.products}</td>
                <td className="p-3">
                  <Badge variant={category.active ? "success" : "neutral"}>
                    {category.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => startTransition(async () => { await reorderCategoryAction(category.id, "up"); router.refresh(); })}
                      className="rounded-lg p-2 text-secondary-text hover:bg-off-white disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      disabled={index === categories.length - 1}
                      onClick={() => startTransition(async () => { await reorderCategoryAction(category.id, "down"); router.refresh(); })}
                      className="rounded-lg p-2 text-secondary-text hover:bg-off-white disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => startTransition(async () => { await toggleCategoryActiveAction(category.id, !category.active); router.refresh(); })}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-secondary-text hover:bg-off-white"
                    >
                      {category.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => openEdit(category)} aria-label="Edit" className="rounded-lg p-2 text-secondary-text hover:bg-off-white hover:text-brand-black">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${category.name}"?`)) {
                          startTransition(async () => {
                            const result = await deleteCategoryAction(category.id);
                            if (result.error) showToast({ kind: "error", title: "Cannot delete", message: result.error });
                            router.refresh();
                          });
                        }
                      }}
                      aria-label="Delete"
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={editing?.name} />
          </div>
          <div>
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input id="icon" name="icon" placeholder="📱" defaultValue={editing?.icon ?? ""} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-black">
            <Checkbox name="active" defaultChecked={editing?.active ?? true} />
            Active
          </label>
          <Button type="submit" className="w-full" disabled={isPending}>
            {editing ? "Save Changes" : "Create Category"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
