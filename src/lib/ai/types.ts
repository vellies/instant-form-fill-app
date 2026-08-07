export interface FieldOption {
  value: string;
  text: string;
}

export interface FieldDescriptor {
  index: number;
  tag: "input" | "select" | "textarea";
  type: string;
  name: string;
  id: string;
  label: string;
  placeholder: string;
  autocomplete: string;
  options?: FieldOption[];
}

export interface FieldMatch {
  index: number;
  value: string;
}

export interface AiMatchResult {
  matches: FieldMatch[];
}

export type AiProviderId = "claude" | "gemini" | "gpt";

export type AiProvider = (profile: Record<string, string>, fields: FieldDescriptor[]) => Promise<AiMatchResult>;

export interface OtherEntry {
  label: string;
  value: string;
}

export interface OtherExtraction {
  entries: OtherEntry[];
}

// Deliberately no shared "OtherExtractor" function-type here, unlike
// AiProvider above: Claude/Gemini take the raw PDF (both read documents
// natively) while GPT takes pre-extracted text (Chat Completions has no
// native PDF input), so each provider's extractOther has a genuinely
// different signature — forcing a common interface would just hide that.
