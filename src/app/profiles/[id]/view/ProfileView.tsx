import Link from "next/link";
import type { DynamicFieldValues, FieldType } from "@/lib/profileSchema";
import CopyButton from "./CopyButton";

function TextTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M5 6h14M5 12h14M5 18h9" strokeLinecap="round" />
    </svg>
  );
}

function NumberTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6 4v16M6 4v16m6-16v16m6-16v16M4 9h16M4 15h16" strokeLinecap="round" />
    </svg>
  );
}

function DateTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function EmailTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6.5 3h3l1.2 4.5-2.2 1.6a13 13 0 0 0 6.4 6.4l1.6-2.2 4.5 1.2v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UrlTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M9.5 14.5 14.5 9.5M8 12l-2.3 2.3a3 3 0 0 0 4.2 4.2L12 16.5M16 12l2.3-2.3a3 3 0 0 0-4.2-4.2L12 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TextareaTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M7 9h10M7 12.5h10M7 16h6" strokeLinecap="round" />
    </svg>
  );
}

function FileTypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
    </svg>
  );
}

const FIELD_TYPE_ICONS: Record<FieldType, () => React.JSX.Element> = {
  text: TextTypeIcon,
  number: NumberTypeIcon,
  date: DateTypeIcon,
  email: EmailTypeIcon,
  phone: PhoneTypeIcon,
  url: UrlTypeIcon,
  textarea: TextareaTypeIcon,
  file: FileTypeIcon,
};

// Colorblind-safe categorical palette — picked at random per field (not tied
// to field type), so cards get varied colors even when several fields share
// the same type.
const FIELD_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
];

export default function ProfileView({
  id,
  uniqueId,
  profile,
  fields,
  updatedAt,
}: {
  id: string;
  uniqueId: string | null;
  profile: { name: string; email: string; phone: string };
  fields: DynamicFieldValues[];
  updatedAt: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/profiles" className="btn-secondary no-underline">
          ← Back to profiles
        </Link>
        <div className="flex items-center gap-2.5">
          {uniqueId && <span className="badge">{uniqueId}</span>}
          <Link href={`/profiles/${id}`} className="btn-primary no-underline">
            Edit profile
          </Link>
        </div>
      </div>

      <section className="card px-7 py-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink">Profile name</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
          <div className="field mb-0">
            <span className="text-[12.5px] font-semibold text-ink-muted">Name</span>
            <div className="flex items-center gap-1">
              <p className="text-[13.5px] text-ink">{profile.name || "—"}</p>
              <CopyButton value={profile.name} />
            </div>
          </div>
          <div className="field mb-0">
            <span className="text-[12.5px] font-semibold text-ink-muted">Email</span>
            <div className="flex items-center gap-1">
              <p className="text-[13.5px] text-ink">{profile.email || "—"}</p>
              <CopyButton value={profile.email} />
            </div>
          </div>
          <div className="field mb-0">
            <span className="text-[12.5px] font-semibold text-ink-muted">Phone</span>
            <div className="flex items-center gap-1">
              <p className="text-[13.5px] text-ink">{profile.phone || "—"}</p>
              <CopyButton value={profile.phone} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-ink-muted">
          Last updated {new Date(updatedAt).toLocaleString()}
        </p>
      </section>

      <section className="card px-7 py-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink">Fields</h2>
        {fields.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No fields yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
            {fields.map((field, index) => {
              const Icon = FIELD_TYPE_ICONS[field.type];
              const color = FIELD_COLORS[Math.floor(Math.random() * FIELD_COLORS.length)];
              return (
                <div
                  key={index}
                  style={{
                    ["--field-color" as string]: color,
                    borderLeftColor: color,
                    borderLeftWidth: 4,
                  }}
                  className="flex items-start gap-3 rounded-[14px] border border-border px-4 py-3 transition-all duration-150 ease-in-out hover:border-[color:var(--field-color)] hover:bg-[color-mix(in_oklab,var(--field-color)_8%,white)] hover:shadow-[0_4px_14px_-6px_var(--field-color)]"
                >
                  <span
                    style={{ color, backgroundColor: `${color}1a` }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  >
                    <Icon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ink-muted">{field.label || "—"}</p>
                    <p className="break-words text-[13.5px] text-ink">{field.value || "—"}</p>
                  </div>
                  <CopyButton value={field.value} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
