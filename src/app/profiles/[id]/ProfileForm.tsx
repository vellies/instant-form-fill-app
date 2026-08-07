"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DynamicFieldsCard from "../DynamicFieldsCard";
import Toast from "@/components/Toast";
import { setPendingToast } from "@/lib/pendingToast";
import {
  profileFormSchema,
  flattenFieldErrors,
  findDuplicateLabelIndexes,
  findEmptyFieldIndexes,
  type ProfileFormValues,
  type DynamicFieldValues,
} from "@/lib/profileSchema";

export default function ProfileForm({
  id,
  uniqueId,
  profile,
  fields: initialFields,
}: {
  id: string;
  uniqueId: string | null;
  profile: ProfileFormValues;
  fields: DynamicFieldValues[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>(profile);
  const [fields, setFields] = useState<DynamicFieldValues[]>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [status, setStatus] = useState<{ type: "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDuplicateErrors, setShowDuplicateErrors] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

    if (findEmptyFieldIndexes(fields).size > 0) {
      setShowDuplicateErrors(true);
      setToast("Fill in a label and value for every field, or remove the empty ones");
      return;
    }
    if (findDuplicateLabelIndexes(fields).size > 0) {
      setShowDuplicateErrors(true);
      setToast("Field labels must be unique");
      return;
    }
    setShowDuplicateErrors(false);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, fields }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setStatus({ type: "error", message: data.error ?? "Could not save profile" });
        return;
      }

      setPendingToast("Profile updated");
      router.push("/profiles");
      router.refresh();
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

      <section className="card px-7 py-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink">Profile name</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
          <div className="field mb-0">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="mt-1 text-[12px] text-danger">{errors.name}</p>}
          </div>
          <div className="field mb-0">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-1 text-[12px] text-danger">{errors.email}</p>}
          </div>
          <div className="field mb-0">
            <label htmlFor="profile-phone">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-[12px] text-danger">{errors.phone}</p>}
          </div>
        </div>
      </section>

      <DynamicFieldsCard fields={fields} onChange={setFields} showDuplicateErrors={showDuplicateErrors} />

      {status && <div className="status-box status-error">{status.message}</div>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save profile"}
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </form>
  );
}
