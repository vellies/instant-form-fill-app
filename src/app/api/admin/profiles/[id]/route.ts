import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { profileFormSchema, flattenFieldErrors } from "@/lib/profileSchema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || (profile.userId !== user.id && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || (existing.userId !== user.id && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields", fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  const profile = await prisma.profile.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ profile });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || (existing.userId !== user.id && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
