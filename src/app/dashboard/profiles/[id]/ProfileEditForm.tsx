"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROFILE_FIELDS } from "@/lib/profile";

type ProfileFormValues = Record<(typeof PROFILE_FIELDS)[number], string>;

const FIELD_GROUPS: { title: string; fields: { key: keyof ProfileFormValues; label: string }[] }[] = [
  {
    title: "Personal",
    fields: [
      { key: "name", label: "Profile name" },
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "dateOfBirth", label: "Date of birth" },
      { key: "gender", label: "Gender" },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zipCode", label: "ZIP code" },
      { key: "country", label: "Country" },
    ],
  },
  {
    title: "Links",
    fields: [
      { key: "linkedinUrl", label: "LinkedIn URL" },
      { key: "portfolioUrl", label: "Portfolio URL" },
      { key: "resumeUrl", label: "Resume URL" },
    ],
  },
  {
    title: "Education",
    fields: [
      { key: "schoolName", label: "School" },
      { key: "degree", label: "Degree" },
      { key: "major", label: "Major" },
      { key: "graduationYear", label: "Graduation year" },
      { key: "gpa", label: "GPA" },
    ],
  },
];

export default function ProfileEditForm({ profileId, values: initialValues }: { profileId: string; values: ProfileFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function handleChange(key: keyof ProfileFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not save profile" });
        return;
      }

      setStatus({ type: "success", message: "Profile saved" });
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {FIELD_GROUPS.map((group) => (
        <section key={group.title} className="card px-7 py-6">
          <h2 className="mb-4 text-[15px] font-bold text-ink">{group.title}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
            {group.fields.map((field) => (
              <div className="field mb-0" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <input
                  id={field.key}
                  value={values[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {status && <div className={`status-box status-${status.type}`}>{status.message}</div>}

      <div className="flex gap-2.5">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save profile"}
        </button>
        <Link href="/dashboard/profiles" className="btn-secondary no-underline">
          Back to all profiles
        </Link>
      </div>
    </form>
  );
}
