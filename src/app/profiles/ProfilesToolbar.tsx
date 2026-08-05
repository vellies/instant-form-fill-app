"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/dashboard/Modal";
import ProfileFields from "./ProfileFields";
import { profileFormSchema, flattenFieldErrors, EMPTY_PROFILE_VALUES, type ProfileFormValues } from "@/lib/profileSchema";

export default function ProfilesToolbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ProfileFormValues>(EMPTY_PROFILE_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openModal() {
    setValues(EMPTY_PROFILE_VALUES);
    setErrors({});
    setError("");
    setOpen(true);
  }

  function handleChange(key: keyof ProfileFormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const parsed = profileFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(flattenFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setError(data.error ?? "Could not create profile");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach the server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="btn-primary whitespace-nowrap" onClick={openModal}>
        + New Profile
      </button>

      {open && (
        <Modal title="New profile" onClose={() => setOpen(false)} wide>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ProfileFields values={values} errors={errors} onChange={handleChange} bare />
            {error && <div className="status-box status-error">{error}</div>}
            <div className="flex justify-end gap-2.5">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating…" : "Create profile"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
