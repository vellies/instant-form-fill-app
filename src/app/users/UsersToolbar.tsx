"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UsersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="card flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="field mb-0 min-w-[220px] flex-1">
        <input
          type="text"
          placeholder="Search users by email..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          aria-label="Search users"
        />
      </div>
      <Link href="/users/new" className="btn-primary whitespace-nowrap no-underline">
        + Add User
      </Link>
    </div>
  );
}
