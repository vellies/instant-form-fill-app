import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function currentWindowStart(): Date {
  return new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
}

// Fixed 1-minute window, create-then-increment. Generous enough for real
// usage, low enough to blunt a leaked API key or a buggy retry loop from
// running up the AI provider bill unnoticed.
//
// Deliberately not `upsert` — Prisma's MongoDB connector runs upsert as a
// transaction, which requires the Mongo deployment to be a replica set.
// This is the only rate-limit row per user per minute, so the plain
// create-first approach below (falling back to update if another request
// already created it) gives the same result as an upsert without needing
// a transaction.
export async function checkAndConsume(userId: string): Promise<boolean> {
  const windowStart = currentWindowStart();

  try {
    const record = await prisma.aiRateLimit.create({ data: { userId, windowStart, count: 1 } });
    return record.count <= MAX_PER_WINDOW;
  } catch {
    // Another request in this window already created the row.
    const record = await prisma.aiRateLimit.update({
      where: { userId_windowStart: { userId, windowStart } },
      data: { count: { increment: 1 } },
    });
    return record.count <= MAX_PER_WINDOW;
  }
}
