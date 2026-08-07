"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/dashboard/Modal";

type Row = {
  id: string;
  uniqueId: string | null;
  name: string;
  email: string;
  phone: string;
  updatedAt: string;
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

export default function MyProfilesTable({ profiles }: { profiles: Row[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [removing, setRemoving] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    if (!deleting) return;
    setRemoving(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/admin/profiles/${deleting.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error ?? "Could not delete profile");
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
            <th className={th}>ID</th>
            <th className={th}>Name</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>Updated</th>
            <th className={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td className={td}>
                <span className="badge">{p.uniqueId ?? "—"}</span>
              </td>
              <td className={td}>{p.name}</td>
              <td className={td}>{p.email || "—"}</td>
              <td className={td}>{p.phone || "—"}</td>
              <td className={td}>{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td className={td}>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profiles/${p.id}`}
                    title="Edit profile"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft no-underline hover:bg-surface-muted"
                  >
                    <EditIcon />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(p);
                      setDeleteError("");
                    }}
                    title="Delete profile"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-danger hover:bg-danger-light"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {profiles.length === 0 && (
            <tr>
              <td className={td} colSpan={6}>
                No profiles yet. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {deleting && (
        <Modal title="Delete profile" onClose={() => setDeleting(null)}>
          <p className="mb-4 text-sm text-ink-soft">
            Delete <strong className="text-ink">{deleting.name}</strong>? This can&apos;t be undone.
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
