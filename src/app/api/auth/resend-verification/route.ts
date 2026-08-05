import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVerificationToken } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/mailer";

function appUrl(request: Request): string {
  return process.env.APP_URL || new URL(request.url).origin;
}

const GENERIC_RESPONSE = { message: "If that account exists and isn't verified yet, we've sent a new link." };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    const token = await createVerificationToken(user.id);
    const verifyUrl = `${appUrl(request)}/api/auth/verify?token=${token}`;
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
