import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireRole } from "@/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === requester.id) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role === "SUPERADMIN" || body?.role === "ADMIN" ? body.role : null;
  if (!role) {
    return NextResponse.json({ error: "A valid role is required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ id: updated.id, email: updated.email, role: updated.role });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requester = await getSessionUser(request);
  if (!requireRole(requester, ["SUPERADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === requester.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
