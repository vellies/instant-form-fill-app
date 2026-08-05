"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Modal from "@/components/dashboard/Modal";

export default function UsersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function closeModal() {
    setOpen(false);
    setEmail("");
    setPassword("");
    setRole("ADMIN");
    setStatus(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not create account" });
        return;
      }

      closeModal();
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="field mb-0 min-w-[220px] flex-1">
        <input
          type="text"
          placeholder="Search users by email..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          aria-label="Search users"
        />
      </div>
      <button type="button" className="btn-primary whitespace-nowrap" onClick={() => setOpen(true)}>
        + Add User
      </button>

      {open && (
        <Modal title="Add user" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="field mb-0">
              <label htmlFor="new-email">Email</label>
              <input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field mb-0">
              <label htmlFor="new-password">Password</label>
              <input
                id="new-password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="field mb-0">
              <label htmlFor="new-role">Role</label>
              <select id="new-role" value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPERADMIN")}>
                <option value="ADMIN">Admin</option>
                <option value="SUPERADMIN">Superadmin</option>
              </select>
            </div>
            {status && <div className={`status-box status-${status.type}`}>{status.message}</div>}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating…" : "Create account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
