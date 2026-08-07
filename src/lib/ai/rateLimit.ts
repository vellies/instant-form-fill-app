import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function currentWindowStart(): Date {
  return new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
}

// Fixed 1-minute window, upsert-increment. Generous enough for real usage,
// low enough to blunt a leaked API key or a buggy retry loop from running up
// the AI provider bill unnoticed.
export async function checkAndConsume(userId: string): Promise<boolean> {
  const windowStart = currentWindowStart();
  const record = await prisma.aiRateLimit.upsert({
    where: { userId_windowStart: { userId, windowStart } },
    create: { userId, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });
  return record.count <= MAX_PER_WINDOW;
}
