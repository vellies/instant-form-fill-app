"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DynamicFieldsCard from "../DynamicFieldsCard";
import Toast from "@/components/Toast";
import { setPendingToast } from "@/lib/pendingToast";
import {
  profileFormSchema,
  flattenFieldErrors,
  findDuplicateLabelIndexes,
  findEmptyFieldIndexes,
  EMPTY_PROFILE_VALUES,
  type ProfileFormValues,
  type DynamicFieldValues,
} from "@/lib/profileSchema";

export default function AddProfileForm() {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>(EMPTY_PROFILE_VALUES);
  const [fields, setFields] = useState<DynamicFieldValues[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [status, setStatus] = useState<{ type: "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, fields }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setStatus({ type: "error", message: data.error ?? "Could not create profile" });
        return;
      }

      setPendingToast("Profile created");
      router.push("/profiles");
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

      <div className="flex gap-2.5">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Creating…" : "Create profile"}
        </button>
        <Link href="/profiles" className="btn-secondary no-underline">
          Cancel
        </Link>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </form>
  );
}
