"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileFields from "../ProfileFields";
import { profileFormSchema, flattenFieldErrors, type ProfileFormValues } from "@/lib/profileSchema";

export default function ProfileForm({
  id,
  uniqueId,
  profile,
}: {
  id: string;
  uniqueId: string | null;
  profile: ProfileFormValues;
}) {
  const [values, setValues] = useState<ProfileFormValues>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function handleChange(key: keyof ProfileFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    const parsed = profileFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(flattenFieldErrors(parsed.error));
      setStatus({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setStatus({ type: "error", message: data.error ?? "Could not save profile" });
        return;
      }

      setStatus({ type: "success", message: "Profile saved" });
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/profiles" className="btn-secondary no-underline">
          ← Back to profiles
        </Link>
        {uniqueId && <span className="badge">{uniqueId}</span>}
      </div>

      <ProfileFields values={values} errors={errors} onChange={handleChange} />

      {status && <div className={`status-box status-${status.type}`}>{status.message}</div>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
