import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { profileFormSchema, flattenFieldErrors } from "@/lib/profileSchema";
import { generateUniqueProfileId } from "@/lib/profileId";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields", fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  const uniqueId = await generateUniqueProfileId();
  const profile = await prisma.profile.create({
    data: { userId: user.id, uniqueId, ...parsed.data },
  });
  return NextResponse.json({ profile });
}
