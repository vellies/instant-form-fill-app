import type { FieldDescriptor } from "./types";

export const SYSTEM_PROMPT =
  "You fill out web forms on a user's behalf using their saved profile data. " +
  "You will be given the user's profile as a flat key/value object, and a list of " +
  "candidate form fields found on the current page, each with an index and whatever " +
  "label/name/id/placeholder/autocomplete text was found for it. Field labels may be " +
  "in any language, may be worded very differently from the profile's field names, and " +
  "the page may be a completely different kind of form (e.g. a government registration " +
  "form) than what the profile was designed for. Use your judgment to match fields to " +
  "profile values by meaning, not just literal string overlap. " +
  "Rules: " +
  "1) Only return a field if you are reasonably confident about the match. " +
  "2) Never invent a value that is not present in the given profile. " +
  "3) For a field with an `options` list, `value` must be exactly one of that field's " +
  "`options[].value` or `options[].text` — never free text. " +
  "4) If no profile value confidently matches a field, omit that field from the results " +
  "entirely rather than guessing or returning an empty string. " +
  "5) Respond with matches only, no explanation.";

export function buildUserPrompt(profile: Record<string, string>, fields: FieldDescriptor[]): string {
  return JSON.stringify({ profile, fields });
}

export const OTHER_SYSTEM_PROMPT =
  "You extract miscellaneous label/value information from an uploaded document (certificate, " +
  "ID card, marksheet, or similar) that a user wants to add as freeform extra fields on their " +
  "profile. Extract every distinct piece of identifying or qualification information you find " +
  "— e.g. ID/certificate numbers, issuing authority, dates, qualification percentages, skills " +
  "— as short label/value pairs. Use concise, human-readable labels drawn from the document " +
  "itself rather than a fixed vocabulary. " +
  "Rules: " +
  "1) Never invent a label or value that is not evidenced in the document. " +
  "2) Omit anything unclear or not explicitly stated rather than guessing. " +
  "3) Respond with the structured result only, no explanation.";

export function buildOtherExtractionPrompt(): string {
  return "Extract every label/value pair you can find in this document.";
}
