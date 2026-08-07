"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

function pageNumbers(current: number, total: number): (number | "…")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    router.push(`${pathname}?${params.toString()}`);
  }

  function changePageSize(size: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(size));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-ink-muted">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing {start} - {end} of {total}
        </span>
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <label className="flex items-center gap-1.5">
            Per page
            <select
              aria-label="Profiles per page"
              value={pageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="rounded-[10px] border border-border bg-surface-muted px-2 py-1 text-[13px] text-ink outline-none focus:border-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="rounded-[10px] px-2.5 py-1.5 font-semibold text-ink-soft hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {pageNumbers(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              className={`h-7 w-7 rounded-[10px] font-semibold ${
                p === page ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="rounded-[10px] px-2.5 py-1.5 font-semibold text-ink-soft hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
