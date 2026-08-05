import { prisma } from "./db";

function randomCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return `VR${String(n).padStart(6, "0")}`;
}

export async function generateUniqueProfileId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomCode();
    const existing = await prisma.profile.findUnique({ where: { uniqueId: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique profile ID");
}
