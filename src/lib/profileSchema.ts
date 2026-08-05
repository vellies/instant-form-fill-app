import { z } from "zod";
import { PROFILE_FIELDS } from "./profile";

function text(max: number) {
  return z.string().trim().max(max, "Too long");
}

const optionalEmail = z
  .string()
  .trim()
  .max(200, "Too long")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address");

const optionalUrl = z
  .string()
  .trim()
  .max(300, "Too long")
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a valid URL starting with http:// or https://");

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Profile name is required").max(120, "Too long"),
  firstName: text(80),
  lastName: text(80),
  email: optionalEmail,
  phone: text(40),
  dateOfBirth: text(40),
  gender: text(40),
  address: text(200),
  city: text(100),
  state: text(100),
  zipCode: text(20),
  country: text(100),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  schoolName: text(150),
  degree: text(100),
  major: text(100),
  graduationYear: text(10),
  gpa: text(10),
  resumeUrl: optionalUrl,
} satisfies Record<(typeof PROFILE_FIELDS)[number], z.ZodTypeAny>);

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const EMPTY_PROFILE_VALUES: ProfileFormValues = Object.fromEntries(
  PROFILE_FIELDS.map((field) => [field, ""])
) as ProfileFormValues;

export function flattenFieldErrors(error: z.ZodError): Partial<Record<keyof ProfileFormValues, string>> {
  const out: Partial<Record<keyof ProfileFormValues, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ProfileFormValues;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
