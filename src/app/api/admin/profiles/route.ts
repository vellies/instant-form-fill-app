import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireRole } from "@/lib/session";

export async function GET(request: Request) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profiles = await prisma.profile.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : "New Profile";

  if (!userId) {
    return NextResponse.json({ error: "A user must be selected" }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await prisma.profile.create({
    data: { userId, name },
    include: { user: { select: { email: true } } },
  });
  return NextResponse.json({ profile }, { status: 201 });
}
