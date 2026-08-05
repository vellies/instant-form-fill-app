"use client";

import type { ProfileFormValues } from "@/lib/profileSchema";
import { PROFILE_FIELD_GROUPS } from "@/lib/profileFields";

export default function ProfileFields({
  values,
  errors,
  onChange,
  bare = false,
}: {
  values: ProfileFormValues;
  errors: Partial<Record<keyof ProfileFormValues, string>>;
  onChange: (key: keyof ProfileFormValues, value: string) => void;
  bare?: boolean;
}) {
  const sectionClass = bare ? "rounded-[18px] border border-border px-5 py-4" : "card px-7 py-6";

  return (
    <>
      {PROFILE_FIELD_GROUPS.map((group) => (
        <section key={group.title} className={sectionClass}>
          <h2 className="mb-4 text-[15px] font-bold text-ink">{group.title}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
            {group.fields.map((field) => (
              <div className="field mb-0" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <input
                  id={field.key}
                  value={values[field.key]}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  aria-invalid={Boolean(errors[field.key])}
                />
                {errors[field.key] && <p className="mt-1 text-[12px] text-danger">{errors[field.key]}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
