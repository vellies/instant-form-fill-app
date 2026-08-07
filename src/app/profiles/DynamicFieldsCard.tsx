"use client";

import { useMemo, useState } from "react";
import type { AiProviderId } from "@/lib/ai/types";
import {
  EMPTY_DYNAMIC_FIELD,
  FIELD_TYPES,
  findDuplicateLabelIndexes,
  findEmptyFieldIndexes,
  type DynamicFieldValues,
  type FieldType,
} from "@/lib/profileSchema";

// Deliberately no width utility here — every call site in this file pairs
// this with its own explicit w-[Npx] override, and Tailwind's generated
// stylesheet happens to emit `.w-full` after arbitrary-value width
// utilities, so a bundled `w-full` would win the cascade regardless of
// where it sits in the className string (HTML class-attribute order does
// not affect CSS cascade order — only the compiled stylesheet's rule order
// does for equal-specificity selectors).
const rowControl =
  "rounded-[12px] border border-border bg-surface-muted px-2.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors duration-150 ease-in-out focus:border-primary focus:bg-surface";

const rowControlDanger =
  "rounded-[12px] border border-danger bg-surface-muted px-2.5 py-2 font-sans text-[13px] text-ink outline-none transition-colors duration-150 ease-in-out focus:border-danger focus:bg-surface";

const iconBtn = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent";

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PROVIDERS: { id: AiProviderId; label: string }[] = [
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "gpt", label: "GPT" },
];

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  email: "Email",
  phone: "Phone",
  url: "URL",
  textarea: "Textarea",
  file: "File",
};

// Maps a field's type to the HTML <input type> that gives the right
// keyboard/validation on mobile and desktop; textarea is rendered as its
// own element instead of an <input>.
const HTML_INPUT_TYPE: Partial<Record<FieldType, string>> = {
  number: "number",
  date: "date",
  email: "email",
  phone: "tel",
  url: "url",
};

export default function DynamicFieldsCard({
  fields,
  onChange,
  showDuplicateErrors = false,
}: {
  fields: DynamicFieldValues[];
  onChange: (fields: DynamicFieldValues[]) => void;
  showDuplicateErrors?: boolean;
}) {
  const duplicateIndexes = useMemo(() => findDuplicateLabelIndexes(fields), [fields]);
  const emptyIndexes = useMemo(() => findEmptyFieldIndexes(fields), [fields]);
  const [files, setFiles] = useState<File[]>([]);
  const [provider, setProvider] = useState<AiProviderId>("gemini");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Files picked in a per-row "File" type input, keyed by row index — kept
  // separate from `fields` since the persisted value for a file field is
  // just the file name, not the file itself (see DynamicFieldsCard's file
  // handling note: no storage backend, name-only).
  const [rowFiles, setRowFiles] = useState<Record<number, File>>({});
  const [extractingIndex, setExtractingIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function updateField(index: number, key: keyof DynamicFieldValues, value: string) {
    onChange(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function moveField(from: number, to: number) {
    if (from === to || to < 0 || to >= fields.length) return;
    const next = [...fields];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function addField() {
    onChange([...fields, { ...EMPTY_DYNAMIC_FIELD }]);
  }

  async function extractFiles(filesToExtract: File[]): Promise<DynamicFieldValues[] | null> {
    const formData = new FormData();
    for (const file of filesToExtract) {
      formData.append("files", file);
    }
    formData.append("provider", provider);

    const response = await fetch("/api/admin/other/extract", { method: "POST", body: formData });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not extract from the uploaded files");
      return null;
    }

    return (data.entries ?? []).map((entry: { label: string; value: string }) => ({
      type: "text" as FieldType,
      label: entry.label,
      value: entry.value,
    }));
  }

  async function handleExtract() {
    if (files.length === 0) return;
    setExtracting(true);
    setError(null);

    try {
      const extracted = await extractFiles(files);
      if (extracted) {
        onChange([...fields, ...extracted]);
        setFiles([]);
      }
    } catch {
      setError("Could not reach the server");
    } finally {
      setExtracting(false);
    }
  }

  async function handleRowExtract(index: number) {
    const file = rowFiles[index];
    if (!file) return;
    setExtractingIndex(index);
    setError(null);

    try {
      const extracted = await extractFiles([file]);
      if (extracted) {
        onChange([...fields, ...extracted]);
        setRowFiles((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    } catch {
      setError("Could not reach the server");
    } finally {
      setExtractingIndex(null);
    }
  }

  return (
    <section className="card px-7 py-6">
      <h2 className="mb-4 text-[15px] font-bold text-ink">Fields</h2>
      <p className="mb-3.5 text-[13px] text-ink-soft">
        Add any fields this profile needs (personal details, address, links, IDs, and so on), or
        upload documents (PDF) — Aadhaar card, community certificate, and so on — to extract them
        automatically. You can select multiple files at once. Review and edit everything before
        saving.
      </p>

      <div className="mb-5 rounded-[18px] border border-border px-5 py-4">
        <div className="field mb-0">
          <label htmlFor="dynamic-file">Upload documents (PDF, multiple allowed)</label>
          <div className="flex items-stretch gap-3">
            <input
              id="dynamic-file"
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="min-w-0 flex-1"
            />
            {/* <select id="dynamic-provider" disabled={true} value={provider} onChange={(e) => setProvider(e.target.value as AiProviderId)}>
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select> */}
            <button
              type="button"
              className="btn-secondary shrink-0 bg-black text-white"
              onClick={handleExtract}
              disabled={files.length === 0 || extracting}
            >
              {extracting ? "Extracting…" : "Extract from files"}
            </button>
          </div>
          {files.length > 0 && (
            <p className="mt-1 text-[12px] text-ink-muted">
              {files.length} file{files.length > 1 ? "s" : ""} selected: {files.map((f) => f.name).join(", ")}
            </p>
          )}
        </div>
      </div>
      {error && <div className="status-box status-error">{error}</div>}

      {fields.length === 0 && <p className="mb-3.5 text-[13px] text-ink-muted">No fields yet.</p>}

      <div className="overflow-x-auto">
        <div className="flex min-w-fit flex-col gap-2">
          {fields.map((field, index) => {
            const labelInvalid = showDuplicateErrors && (duplicateIndexes.has(index) || !field.label.trim());
            const valueInvalid = showDuplicateErrors && !field.value.trim();
            const rowMessage = !showDuplicateErrors
              ? null
              : duplicateIndexes.has(index)
                ? "Duplicate label."
                : !field.label.trim() && !field.value.trim()
                  ? "Label and value are required."
                  : !field.label.trim()
                    ? "Label is required."
                    : !field.value.trim()
                      ? "Value is required."
                      : null;

            return (
              <div key={index} className="flex flex-col gap-1">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) moveField(dragIndex, index);
                    setDragIndex(null);
                  }}
                  className={`flex flex-nowrap items-center gap-2 rounded-[14px] border border-border px-2.5 py-2 ${
                    dragIndex === index ? "opacity-40" : ""
                  }`}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    title="Drag to reorder"
                    className={`${iconBtn} cursor-grab active:cursor-grabbing`}
                  >
                    <DragHandleIcon />
                  </button>

                  <span className="w-10 shrink-0 text-center text-[12.5px] font-semibold text-ink-soft">
                    F{index + 1}
                  </span>

                  <select
                    aria-label="Field type"
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className={`${rowControl} w-[95px] shrink-0`}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>

                  <input
                    aria-label="Field label"
                    value={field.label}
                    placeholder="Label"
                    onChange={(e) => updateField(index, "label", e.target.value)}
                    className={`${labelInvalid ? rowControlDanger : rowControl} w-[160px] shrink-0`}
                  />

                  {field.type === "textarea" ? (
                    <textarea
                      aria-label="Field value"
                      value={field.value}
                      rows={1}
                      onChange={(e) => updateField(index, "value", e.target.value)}
                      className={`${valueInvalid ? rowControlDanger : rowControl} w-[260px] shrink-0 resize-y`}
                    />
                  ) : field.type === "file" ? (
                    <input
                      aria-label="Field value"
                      type="file"
                      title={field.value || undefined}
                      onChange={(e) => updateField(index, "value", e.target.files?.[0]?.name ?? "")}
                      className={`${valueInvalid ? rowControlDanger : rowControl} w-[260px] shrink-0`}
                    />
                  ) : (
                    <input
                      aria-label="Field value"
                      type={HTML_INPUT_TYPE[field.type] ?? "text"}
                      value={field.value}
                      placeholder="Value"
                      onChange={(e) => updateField(index, "value", e.target.value)}
                      className={`${valueInvalid ? rowControlDanger : rowControl} w-[260px] shrink-0`}
                    />
                  )}

                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveField(index, index - 1)}
                    className={iconBtn}
                  >
                    <UpIcon />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === fields.length - 1}
                    onClick={() => moveField(index, index + 1)}
                    className={iconBtn}
                  >
                    <DownIcon />
                  </button>
                  <button
                    type="button"
                    title="Remove field"
                    onClick={() => removeField(index)}
                    className={`${iconBtn} text-danger hover:bg-danger-light`}
                  >
                    <RemoveIcon />
                  </button>
                </div>
                {rowMessage && <p className="ml-[52px] text-[12px] text-danger">{rowMessage}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <button type="button" className="btn-secondary mt-4" onClick={addField}>
        + Add field
      </button>
    </section>
  );
}
