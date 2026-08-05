"use client";

import { useState } from "react";
import Modal from "@/components/dashboard/Modal";

function mask(key: string) {
  return `${key.slice(0, 4)}${"•".repeat(Math.max(key.length - 8, 4))}${key.slice(-4)}`;
}

export default function ApiKeyCard({ initialApiKey }: { initialApiKey: string }) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleCopy() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/settings/api-key", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not regenerate key");
        return;
      }

      setApiKey(data.apiKey);
      setRevealed(true);
      setConfirming(false);
    } catch {
      setError("Could not reach the server");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <section className="card px-7 py-6">
      <h2 className="mb-1 text-[15px] font-bold text-ink">Extension API key</h2>
      <p className="mb-4 text-[13px] text-ink-muted">
        Paste this into the VR Instant Fill browser extension so it can sync your profile.
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        <code className="flex-1 min-w-[220px] rounded-[14px] border border-border bg-surface-muted px-3 py-2.5 font-mono text-sm text-ink">
          {revealed ? apiKey : mask(apiKey)}
        </code>
        <button type="button" className="btn-secondary" onClick={() => setRevealed((v) => !v)}>
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setConfirming(true)}>
          Regenerate
        </button>
      </div>

      {error && <div className="status-box status-error mt-3">{error}</div>}

      {confirming && (
        <Modal title="Regenerate API key" onClose={() => setConfirming(false)}>
          <p className="mb-4 text-sm text-ink-soft">
            This invalidates your current key. Any browser extension using the old key will stop syncing until you
            update it.
          </p>
          <div className="flex justify-end gap-2.5">
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button type="button" disabled={regenerating} className="btn-primary" onClick={handleRegenerate}>
              {regenerating ? "Regenerating…" : "Regenerate key"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
