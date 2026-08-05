"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords don't match" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: data.error ?? "Could not update password" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", message: "Password updated" });
    } catch {
      setStatus({ type: "error", message: "Could not reach the server" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card px-7 py-6">
      <h2 className="mb-4 text-[15px] font-bold text-ink">Change password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
          <div className="field mb-0">
            <label htmlFor="current-password">Current password</label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="field mb-0">
            <label htmlFor="new-password-settings">New password</label>
            <PasswordInput
              id="new-password-settings"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="field mb-0">
            <label htmlFor="confirm-password">Confirm new password</label>
            <PasswordInput
              id="confirm-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {status && <div className={`status-box status-${status.type}`}>{status.message}</div>}
        <button type="submit" disabled={submitting} className="btn-primary w-fit">
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
