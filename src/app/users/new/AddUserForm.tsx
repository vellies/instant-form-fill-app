"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function AddUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

      router.push("/users");
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="field mb-0">
        <label htmlFor="new-email">Email</label>
        <input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="field mb-0">
        <label htmlFor="new-password">Password</label>
        <PasswordInput
          id="new-password"
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
      <div className="flex gap-2.5">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Creating…" : "Create account"}
        </button>
        <Link href="/users" className="btn-secondary no-underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
