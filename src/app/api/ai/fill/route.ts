import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { checkAndConsume } from "@/lib/ai/rateLimit";
import { claude } from "@/lib/ai/claude";
import { gemini } from "@/lib/ai/gemini";
import { gpt } from "@/lib/ai/gpt";
import type { AiProvider, AiProviderId, FieldDescriptor } from "@/lib/ai/types";

export const maxDuration = 30;

const PROVIDERS: Record<AiProviderId, AiProvider> = { claude, gemini, gpt };
const MAX_FIELDS = 200;

function isFieldDescriptor(value: unknown): value is FieldDescriptor {
  if (!value || typeof value !== "object") return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.index === "number" &&
    (f.tag === "input" || f.tag === "select" || f.tag === "textarea") &&
    typeof f.type === "string" &&
    typeof f.name === "string" &&
    typeof f.id === "string" &&
    typeof f.label === "string" &&
    typeof f.placeholder === "string" &&
    typeof f.autocomplete === "string"
  );
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const withinLimit = await checkAndConsume(user.id);
  if (!withinLimit) {
    return NextResponse.json({ error: "Too many AI fill requests, please slow down" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const provider = body?.provider;
  const profile = body?.profile;
  const fields = body?.fields;

  const validProvider = provider === "claude" || provider === "gemini" || provider === "gpt";
  if (
    !validProvider ||
    !profile ||
    typeof profile !== "object" ||
    !Array.isArray(fields) ||
    fields.length === 0 ||
    fields.length > MAX_FIELDS ||
    !fields.every(isFieldDescriptor)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await PROVIDERS[provider as AiProviderId](profile, fields);
    return NextResponse.json({ matches: result.matches });
  } catch (error) {
    console.error("AI fill request failed:", error);
    return NextResponse.json({ error: "AI provider request failed" }, { status: 502 });
  }
}
