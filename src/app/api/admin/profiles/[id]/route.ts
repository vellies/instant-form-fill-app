import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireRole } from "@/lib/session";
import { PROFILE_FIELDS } from "@/lib/profile";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    if (typeof body[field] === "string") {
      data[field] = body[field];
    }
  }

  const profile = await prisma.profile.update({
    where: { id: params.id },
    data,
    include: { user: { select: { email: true } } },
  });
  return NextResponse.json({ profile });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
