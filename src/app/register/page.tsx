"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      setMessage(data.message ?? "Check your email to verify your account.");
    } catch {
      setError("Could not reach the server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card flex w-full max-w-[360px] flex-col gap-1.5 p-8 text-center">
        <img src="/logo.png" alt="" className="mx-auto mb-1 h-12 w-12 rounded-xl" />
        <h1 className="mb-1 text-[22px] font-bold text-ink">Create an account</h1>
        <p className="mb-3 text-[13.5px] text-ink-muted">
          Sign up free — verify your email, then start filling your profile.
        </p>

        {message ? (
          <div className="status-box status-success">{message}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="status-box status-error mb-2.5">{error}</div>}
            <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-4 text-[13px] text-ink-muted">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
