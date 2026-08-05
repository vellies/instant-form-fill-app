import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { PROFILE_FIELDS } from "@/lib/profile";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!profile || profile.userId !== user.id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.id) {
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

  const profile = await prisma.profile.update({ where: { id: params.id }, data });
  return NextResponse.json({ profile });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
