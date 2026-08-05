import type { ProfileFormValues } from "./profileSchema";

export const PROFILE_FIELD_GROUPS: { title: string; fields: { key: keyof ProfileFormValues; label: string }[] }[] = [
  {
    title: "Personal",
    fields: [
      { key: "name", label: "Profile name" },
      { key: "firstName", label: "First name" },
      { key: "lastName", label: "Last name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "dateOfBirth", label: "Date of birth" },
      { key: "gender", label: "Gender" },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zipCode", label: "ZIP code" },
      { key: "country", label: "Country" },
    ],
  },
  {
    title: "Links",
    fields: [
      { key: "linkedinUrl", label: "LinkedIn URL" },
      { key: "portfolioUrl", label: "Portfolio URL" },
      { key: "resumeUrl", label: "Resume URL" },
    ],
  },
  {
    title: "Education",
    fields: [
      { key: "schoolName", label: "School" },
      { key: "degree", label: "Degree" },
      { key: "major", label: "Major" },
      { key: "graduationYear", label: "Graduation year" },
      { key: "gpa", label: "GPA" },
    ],
  },
];
