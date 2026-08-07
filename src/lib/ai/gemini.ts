import { GoogleGenAI, Type } from "@google/genai";
import type { AiProvider, FieldMatch, OtherExtraction } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt, OTHER_SYSTEM_PROMPT, buildOtherExtractionPrompt } from "./prompt";

// Constructed lazily (not at module scope) — see the comment in claude.ts
// for why (Next.js build-time route analysis runs without env vars set).
let ai: GoogleGenAI | undefined;
function getClient(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

// Gemini's SDK uses its own Type-enum-based schema representation rather
// than plain JSON Schema, so this mirrors schema.ts's MATCHES_JSON_SCHEMA
// field-for-field instead of reusing it directly.
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          value: { type: Type.STRING },
        },
        required: ["index", "value"],
      },
    },
  },
  required: ["matches"],
};

export const gemini: AiProvider = async (profile, fields) => {
  // Fast/cheap tier as of this writing — verify against current Gemini
  // model availability and pricing before shipping.
  const response = await getClient().models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildUserPrompt(profile, fields),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    return { matches: [] };
  }

  const parsed = JSON.parse(text) as { matches?: FieldMatch[] };
  return { matches: parsed.matches ?? [] };
};

// Mirrors OTHER_JSON_SCHEMA field-for-field — see the note on RESPONSE_SCHEMA above.
const OTHER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
        },
        required: ["label", "value"],
      },
    },
  },
  required: ["entries"],
};

export async function extractOther(pdfBase64: string): Promise<OtherExtraction> {
  const response = await getClient().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: pdfBase64 } }, { text: buildOtherExtractionPrompt() }] },
    ],
    config: {
      systemInstruction: OTHER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: OTHER_RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    return { entries: [] };
  }

  const parsed = JSON.parse(text) as Partial<OtherExtraction>;
  return { entries: parsed.entries ?? [] };
}
