import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { dynamicFieldsSchema } from "@/lib/profileSchema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.userId !== user.id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: { name?: string; email?: string; phone?: string; fields?: Prisma.InputJsonValue } = {};
  if (typeof (body as { name?: unknown }).name === "string") {
    data.name = (body as { name: string }).name;
  }
  if (typeof (body as { email?: unknown }).email === "string") {
    data.email = (body as { email: string }).email;
  }
  if (typeof (body as { phone?: unknown }).phone === "string") {
    data.phone = (body as { phone: string }).phone;
  }
  if ((body as { fields?: unknown }).fields !== undefined) {
    const fields = dynamicFieldsSchema.safeParse((body as { fields?: unknown }).fields);
    if (!fields.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    data.fields = fields.data;
  }

  const profile = await prisma.profile.update({ where: { id }, data });
  return NextResponse.json({ profile });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
