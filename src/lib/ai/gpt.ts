import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import type { AiProvider, FieldMatch, OtherExtraction } from "./types";
import { MATCHES_JSON_SCHEMA, OTHER_JSON_SCHEMA } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt, OTHER_SYSTEM_PROMPT, buildOtherExtractionPrompt } from "./prompt";

async function pdfToText(pdfBase64: string): Promise<string> {
  const buffer = Buffer.from(pdfBase64, "base64");
  const parser = new PDFParse({ data: buffer });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

// Constructed lazily (not at module scope) — see the comment in claude.ts
// for why (Next.js build-time route analysis runs without env vars set).
let client: OpenAI | undefined;
function getClient(): OpenAI {
  if (!client) client = new OpenAI();
  return client;
}

export const gpt: AiProvider = async (profile, fields) => {
  // Fast/cheap tier as of this writing — verify against current OpenAI
  // model availability and pricing before shipping.
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(profile, fields) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "matches", schema: MATCHES_JSON_SCHEMA, strict: true },
    },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    return { matches: [] };
  }

  const parsed = JSON.parse(text) as { matches?: FieldMatch[] };
  return { matches: parsed.matches ?? [] };
};

// Chat Completions has no native PDF input, so this provider is the one
// place that first converts the PDF to plain text (pdf-parse) before
// sending anything to the model.
export async function extractOther(pdfBase64: string): Promise<OtherExtraction> {
  const text = await pdfToText(pdfBase64);

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: OTHER_SYSTEM_PROMPT },
      { role: "user", content: `${buildOtherExtractionPrompt()}\n\n${text}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "other_extraction", schema: OTHER_JSON_SCHEMA, strict: true },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { entries: [] };
  }

  const parsed = JSON.parse(content) as Partial<OtherExtraction>;
  return { entries: parsed.entries ?? [] };
}
