import Anthropic from "@anthropic-ai/sdk";
import type { AiProvider, FieldMatch, OtherExtraction } from "./types";
import { MATCHES_JSON_SCHEMA, OTHER_JSON_SCHEMA } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt, OTHER_SYSTEM_PROMPT, buildOtherExtractionPrompt } from "./prompt";

// Constructed lazily (not at module scope) so Next.js's build-time route
// analysis doesn't fail when ANTHROPIC_API_KEY isn't set yet — the SDK
// throws immediately on construction if the key is missing, and build-time
// analysis evaluates this module without ever calling the route handler.
let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export const claude: AiProvider = async (profile, fields) => {
  const response = await getClient().messages.create({
    model: "claude-opus-5",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: MATCHES_JSON_SCHEMA } },
    messages: [{ role: "user", content: buildUserPrompt(profile, fields) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined the request");
  }

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) {
    return { matches: [] };
  }

  const parsed = JSON.parse(textBlock.text) as { matches?: FieldMatch[] };
  return { matches: parsed.matches ?? [] };
};

export async function extractOther(pdfBase64: string): Promise<OtherExtraction> {
  const response = await getClient().messages.create({
    model: "claude-opus-5",
    max_tokens: 8192,
    system: OTHER_SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: OTHER_JSON_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
          { type: "text", text: buildOtherExtractionPrompt() },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined the request");
  }

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) {
    return { entries: [] };
  }

  const parsed = JSON.parse(textBlock.text) as Partial<OtherExtraction>;
  return { entries: parsed.entries ?? [] };
}
