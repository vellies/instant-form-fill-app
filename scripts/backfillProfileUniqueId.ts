import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return `VR${String(n).padStart(6, "0")}`;
}

async function generateUniqueProfileId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomCode();
    const existing = await prisma.profile.findUnique({ where: { uniqueId: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique profile ID");
}

async function main() {
  const profiles = await prisma.profile.findMany({ where: { uniqueId: null } });
  console.log(`Backfilling ${profiles.length} profile(s)...`);

  for (const profile of profiles) {
    const uniqueId = await generateUniqueProfileId();
    await prisma.profile.update({ where: { id: profile.id }, data: { uniqueId } });
    console.log(`${profile.id} -> ${uniqueId}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
