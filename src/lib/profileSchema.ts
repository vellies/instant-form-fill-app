import { z } from "zod";

function text(max: number) {
  return z.string().trim().max(max, "Too long");
}

const optionalEmail = z
  .string()
  .trim()
  .max(200, "Too long")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address");

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Profile name is required").max(120, "Too long"),
  email: optionalEmail,
  phone: text(40),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const EMPTY_PROFILE_VALUES: ProfileFormValues = { name: "", email: "", phone: "" };

export function flattenFieldErrors(error: z.ZodError): Partial<Record<keyof ProfileFormValues, string>> {
  const out: Partial<Record<keyof ProfileFormValues, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ProfileFormValues;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// Every piece of profile data (personal, address, links, etc.) is one of
// these dynamic entries — doesn't fit profileFormSchema above (which is
// just the profile's own display name), validated and merged in separately
// by the profile create/update routes.
export const FIELD_TYPES = ["text", "number", "date", "email", "phone", "url", "textarea", "file"] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const dynamicFieldSchema = z.object({
  type: z.enum(FIELD_TYPES),
  label: text(150),
  value: text(1000),
});

// A single extracted government form can easily produce 80-100+ label/value
// pairs (e.g. a multi-page application form) — keep this generous rather
// than tuned to a "typical" profile.
export const dynamicFieldsSchema = z.array(dynamicFieldSchema).max(500, "Too many fields");

export type DynamicFieldValues = z.infer<typeof dynamicFieldSchema>;

export const EMPTY_DYNAMIC_FIELD: DynamicFieldValues = { type: "text", label: "", value: "" };

// Blank labels are excluded — uniqueness only matters once a label is set,
// and flagging every empty row as a "duplicate" of every other empty row
// would be noise, not a real conflict.
export function findDuplicateLabelIndexes(fields: DynamicFieldValues[]): Set<number> {
  const seen = new Map<string, number>();
  const duplicates = new Set<number>();
  fields.forEach((field, i) => {
    const key = field.label.trim().toLowerCase();
    if (!key) return;
    if (seen.has(key)) {
      duplicates.add(seen.get(key)!);
      duplicates.add(i);
    } else {
      seen.set(key, i);
    }
  });
  return duplicates;
}

// A field row with a blank label or blank value isn't meaningful data —
// flag it so the UI can block saving instead of silently persisting it.
export function findEmptyFieldIndexes(fields: DynamicFieldValues[]): Set<number> {
  const empty = new Set<number>();
  fields.forEach((field, i) => {
    if (!field.label.trim() || !field.value.trim()) empty.add(i);
  });
  return empty;
}
