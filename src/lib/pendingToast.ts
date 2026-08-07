const KEY = "pending-toast";

// Set right before a router.push() that unmounts the component showing the
// toast — read by the destination page so the message survives the
// navigation.
export function setPendingToast(message: string) {
  sessionStorage.setItem(KEY, message);
}

// Deliberately doesn't clear on read: React StrictMode (on by default in
// `next dev`) double-invokes effects on mount, and router.push + router.refresh
// can also remount the reading component — a read-and-delete here would lose
// the message on whichever invocation runs second. Clear separately, once the
// toast has actually been shown, via clearPendingToast.
export function peekPendingToast(): string | null {
  return sessionStorage.getItem(KEY);
}

export function clearPendingToast() {
  sessionStorage.removeItem(KEY);
}
