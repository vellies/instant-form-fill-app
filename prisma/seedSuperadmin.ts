import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function randomProfileCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return `VR${String(n).padStart(6, "0")}`;
}

async function generateUniqueProfileId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = randomProfileCode();
    const existing = await prisma.profile.findUnique({ where: { uniqueId: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique profile ID");
}

async function main() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD before running this script (e.g. in apps/web/.env)."
    );
  }
  if (password.length < 8) {
    throw new Error("SUPERADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const profileUniqueId = await generateUniqueProfileId();
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "SUPERADMIN", emailVerified: true },
    create: {
      email,
      passwordHash,
      role: "SUPERADMIN",
      emailVerified: true,
      apiKey: randomBytes(24).toString("base64url"),
      profiles: { create: { uniqueId: profileUniqueId } },
    },
  });

  console.log(`Superadmin ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
