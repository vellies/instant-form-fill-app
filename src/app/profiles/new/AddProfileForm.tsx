"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileFields from "../ProfileFields";
import { profileFormSchema, flattenFieldErrors, EMPTY_PROFILE_VALUES, type ProfileFormValues } from "@/lib/profileSchema";

export default function AddProfileForm() {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>(EMPTY_PROFILE_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [status, setStatus] = useState<{ type: "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setStatus({ type: "error", message: data.error ?? "Could not create profile" });
        return;
      }

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
      <ProfileFields values={values} errors={errors} onChange={handleChange} />

      {status && <div className="status-box status-error">{status.message}</div>}

      <div className="flex gap-2.5">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Creating…" : "Create profile"}
        </button>
        <Link href="/profiles" className="btn-secondary no-underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
