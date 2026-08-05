"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditUserForm({
  id,
  role: initialRole,
}: {
  id: string;
  role: "ADMIN" | "SUPERADMIN";
}) {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">(initialRole);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not update role" });
        return;
      }

      setStatus({ type: "success", message: "Role updated" });
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="field mb-0">
        <label htmlFor="edit-role">Role</label>
        <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPERADMIN")}>
          <option value="ADMIN">Admin</option>
          <option value="SUPERADMIN">Superadmin</option>
        </select>
      </div>
      {status && <div className={`status-box status-${status.type}`}>{status.message}</div>}
      <div className="flex gap-2.5">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save role"}
        </button>
        <Link href="/users" className="btn-secondary no-underline">
          Back to users
        </Link>
      </div>
    </form>
  );
}
