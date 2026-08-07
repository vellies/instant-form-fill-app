import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { generateApiKey } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: { apiKey: generateApiKey() } });
  return NextResponse.json({ apiKey: updated.apiKey });
}
