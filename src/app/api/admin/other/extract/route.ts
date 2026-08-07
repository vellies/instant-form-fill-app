import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { checkAndConsume } from "@/lib/ai/rateLimit";
import { extractOther as extractOtherClaude } from "@/lib/ai/claude";
import { extractOther as extractOtherGemini } from "@/lib/ai/gemini";
import { extractOther as extractOtherGpt } from "@/lib/ai/gpt";
import type { AiProviderId, OtherExtraction } from "@/lib/ai/types";

export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const EXTRACTORS: Record<AiProviderId, (pdfBase64: string) => Promise<OtherExtraction>> = {
  claude: extractOtherClaude,
  gemini: extractOtherGemini,
  gpt: extractOtherGpt,
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const provider = formData?.get("provider");
  const files = formData?.getAll("files") ?? [];

  const validProvider = provider === "claude" || provider === "gemini" || provider === "gpt";
  if (!validProvider || files.length === 0 || !files.every((f): f is File => f instanceof File)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `You can upload at most ${MAX_FILES} files at once` }, { status: 400 });
  }
  if (files.some((f) => f.type !== "application/pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }
  if (files.some((f) => f.size > MAX_FILE_BYTES)) {
    return NextResponse.json({ error: "Each file must be under 10MB" }, { status: 400 });
  }

  // Reserve rate-limit quota for the whole batch up front — one AI call per
  // file — before making any provider requests, so a partially-exhausted
  // budget fails fast instead of wasting calls already made.
  for (let i = 0; i < files.length; i++) {
    const withinLimit = await checkAndConsume(user.id);
    if (!withinLimit) {
      return NextResponse.json({ error: "Too many AI requests, please slow down" }, { status: 429 });
    }
  }

  try {
    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfBase64 = buffer.toString("base64");
        return EXTRACTORS[provider](pdfBase64);
      })
    );
    const entries = results.flatMap((r) => r.entries);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Other-field extraction failed:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 502 });
  }
}
