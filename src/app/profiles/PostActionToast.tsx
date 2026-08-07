"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { clearPendingToast, peekPendingToast } from "@/lib/pendingToast";

export default function PostActionToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(peekPendingToast());
  }, []);

  function handleClose() {
    clearPendingToast();
    setMessage(null);
  }

  if (!message) return null;

  return <Toast type="success" position="top-right" message={message} onClose={handleClose} />;
}
