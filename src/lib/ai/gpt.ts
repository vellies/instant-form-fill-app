import OpenAI from "openai";
import type { AiProvider, FieldMatch } from "./types";
import { MATCHES_JSON_SCHEMA } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

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
