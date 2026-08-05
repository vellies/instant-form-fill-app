"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/dashboard/Modal";

type Row = {
  id: string;
  email: string;
  role: "ADMIN" | "SUPERADMIN";
  emailVerified: boolean;
  createdAt: string;
};

const th = "px-2.5 py-2 border-b border-border text-left text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted";
const td = "border-b border-border px-2.5 py-2.5 text-ink";

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function UsersTable({ users, currentUserId }: { users: Row[]; currentUserId: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState<Row | null>(null);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function openEdit(user: Row) {
    setEditing(user);
    setRole(user.role);
    setError("");
  }

  async function handleSaveRole(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/admins/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update role");
        return;
      }

      setEditing(null);
      router.refresh();
    } catch {
      setError("Could not reach the server");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setRemoving(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/admin/admins/${deleting.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error ?? "Could not delete user");
        return;
      }

      setDeleting(null);
      router.refresh();
    } catch {
      setDeleteError("Could not reach the server");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr>
            <th className={th}>Email</th>
            <th className={th}>Role</th>
            <th className={th}>Verified</th>
            <th className={th}>Created</th>
            <th className={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id}>
                <td className={td}>{u.email}</td>
                <td className={td}>
                  <span className="inline-block rounded-full bg-primary-light px-2 py-0.5 text-[11.5px] font-semibold text-primary-dark">
                    {u.role}
                  </span>
                </td>
                <td className={td}>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${u.emailVerified ? "bg-primary" : "bg-danger"}`}
                      aria-hidden
                    />
                    {u.emailVerified ? "Yes" : "No"}
                  </span>
                </td>
                <td className={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => openEdit(u)}
                      title={isSelf ? "You cannot edit your own role" : "Edit role"}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => {
                        setDeleting(u);
                        setDeleteError("");
                      }}
                      title={isSelf ? "You cannot delete your own account" : "Delete user"}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-danger hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td className={td} colSpan={5}>
                No users match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editing && (
        <Modal title={`Edit role — ${editing.email}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSaveRole} className="flex flex-col gap-3.5">
            <div className="field mb-0">
              <label htmlFor="edit-role">Role</label>
              <select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPERADMIN")}
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPERADMIN">Superadmin</option>
              </select>
            </div>
            {error && <div className="status-box status-error">{error}</div>}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save role"}
            </button>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete user" onClose={() => setDeleting(null)}>
          <p className="mb-4 text-sm text-ink-soft">
            Delete <strong className="text-ink">{deleting.email}</strong>? This also removes their profiles and
            sessions. This can&apos;t be undone.
          </p>
          {deleteError && <div className="status-box status-error mb-3">{deleteError}</div>}
          <div className="flex justify-end gap-2.5">
            <button type="button" className="btn-secondary" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={removing}
              onClick={handleDelete}
              className="cursor-pointer rounded-full border-none bg-danger px-[18px] py-2.5 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-55"
            >
              {removing ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
