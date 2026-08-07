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
