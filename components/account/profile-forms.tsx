"use client";

import { useActionState } from "react";
import { Input, Label, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { updateProfileAction, changePasswordAction } from "@/app/actions/profile";
import type { FormState } from "@/app/actions/auth";

const initialState: FormState = {};

export function ProfileDetailsForm({ name, phone }: { name: string; phone: string }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
        <FieldError message={state?.fieldErrors?.name} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={phone} />
      </div>
      {state?.success && <p className="text-sm font-semibold text-green-700">Profile updated.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
        <FieldError message={state?.fieldErrors?.currentPassword} />
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.newPassword} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        <FieldError message={state?.fieldErrors?.confirmPassword} />
      </div>
      {state?.error && <p className="text-sm font-semibold text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-semibold text-green-700">Password updated.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update Password"}
      </Button>
    </form>
  );
}
