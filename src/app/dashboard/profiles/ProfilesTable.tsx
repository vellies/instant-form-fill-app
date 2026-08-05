"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProfileRow = {
  id: string;
  name: string;
  ownerEmail: string;
  updatedAt: string;
};

type UserOption = { id: string; email: string };

const th = "px-2.5 py-2 border-b border-border text-left text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted";
const td = "border-b border-border px-2.5 py-2.5 text-ink";

export default function ProfilesTable({
  initialProfiles,
  users,
}: {
  initialProfiles: ProfileRow[];
  users: UserOption[];
}) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [name, setName] = useState("New Profile");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const filtered = profiles.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.ownerEmail.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
  });

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) {
      setStatus({ type: "error", message: "Select a user first" });
      return;
    }
    setCreating(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not create profile" });
        return;
      }
      setProfiles((prev) => [
        { id: data.profile.id, name: data.profile.name, ownerEmail: data.profile.user.email, updatedAt: data.profile.updatedAt },
        ...prev,
      ]);
      setName("New Profile");
      setStatus({ type: "success", message: "Profile created" });
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, ownerEmail: string) {
    if (!window.confirm(`Delete "${ownerEmail}"'s profile? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    setStatus(null);
    try {
      const response = await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not delete profile" });
        return;
      }
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="card px-7 py-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink">Create a profile</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] items-start gap-x-5 gap-y-3.5">
            <div className="field mb-0">
              <label htmlFor="owner">Owner</label>
              <select id="owner" value={userId} onChange={(e) => setUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="field mb-0">
              <label htmlFor="profile-name">Profile name</label>
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={creating || users.length === 0} className="btn-primary">
            {creating ? "Creating…" : "Create profile"}
          </button>
        </form>
      </section>

      <section className="card px-7 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-[15px] font-bold text-ink">All profiles ({profiles.length})</h2>
          <input
            type="text"
            placeholder="Search by owner or profile name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-[10px] border border-border bg-surface-muted px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
          />
        </div>
        {status && <div className={`status-box status-${status.type} mb-4`}>{status.message}</div>}
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Owner</th>
              <th className={th}>Profile Name</th>
              <th className={th}>Updated</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className={td}>{p.ownerEmail}</td>
                <td className={td}>{p.name || "Untitled Profile"}</td>
                <td className={td}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td className={td}>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/profiles/${p.id}`} className="btn-secondary px-3 py-1.5 text-[12.5px] no-underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.ownerEmail)}
                      disabled={deletingId === p.id}
                      className="btn-secondary px-3 py-1.5 text-[12.5px] text-danger hover:bg-danger-light"
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className={td} colSpan={4}>
                  No profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
