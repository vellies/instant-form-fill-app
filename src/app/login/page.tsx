"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const justVerified = searchParams.get("verified") === "1";
  const invalidToken = searchParams.get("error") === "invalid_token";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setResendMessage("");
    setNeedsVerification(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed");
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendMessage("");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setResendMessage(data.message ?? "If that account exists, we've sent a new link.");
    } catch {
      setResendMessage("Could not reach the server");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card flex w-full max-w-[360px] flex-col gap-1.5 p-8 text-center">
        <img src="/logo.png" alt="" className="mx-auto mb-1 h-12 w-12 rounded-xl" />
        <h1 className="mb-1 text-[22px] font-bold text-ink">Sign in</h1>
        <p className="mb-3 text-[13.5px] text-ink-muted">Sign in to manage your profiles.</p>

        {justVerified && (
          <div className="status-box status-success">Email verified — you can sign in now.</div>
        )}
        {invalidToken && (
          <div className="status-box status-error">That verification link is invalid or expired.</div>
        )}

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="status-box status-error mb-2.5">{error}</div>}
          {needsVerification && (
            <button type="button" onClick={handleResend} className="btn-secondary mb-2.5">
              Resend verification email
            </button>
          )}
          {resendMessage && <div className="status-box status-success mb-2.5">{resendMessage}</div>}
          <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-[13px] text-ink-muted">
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
