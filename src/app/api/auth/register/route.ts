import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVerificationToken, hashPassword } from "@/lib/session";
import { generateApiKey } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mailer";

function appUrl(request: Request): string {
  return process.env.APP_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "A valid email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.emailVerified) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const user = existing
    ? await prisma.user.update({ where: { email }, data: { passwordHash: await hashPassword(password) } })
    : await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          role: "ADMIN",
          emailVerified: false,
          apiKey: generateApiKey(),
          profiles: { create: {} },
        },
      });

  const token = await createVerificationToken(user.id);
  const verifyUrl = `${appUrl(request)}/api/auth/verify?token=${token}`;

  try {
    await sendVerificationEmail(user.email, verifyUrl);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json(
      { error: "Account created, but the verification email could not be sent. Try resending it shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { message: "Account created. Check your email to verify it before logging in." },
    { status: 201 }
  );
}
