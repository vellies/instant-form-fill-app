"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — copying
      // is a convenience, not critical, so fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      title={copied ? "Copied" : "Copy value"}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
