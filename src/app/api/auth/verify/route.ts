import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/session";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const origin = new URL(request.url).origin;

  const user = token ? await consumeVerificationToken(token) : null;
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  return NextResponse.redirect(`${origin}/login?verified=1`);
}
