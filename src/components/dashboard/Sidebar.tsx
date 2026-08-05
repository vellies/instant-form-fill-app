"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

const NAV_ITEMS: {
  href: string;
  label: string;
  roles?: Role[];
  icon: React.ReactNode;
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    href: "/profiles",
    label: "Profiles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 19.5c1.2-3.2 3.8-5 6.5-5s5.3 1.8 6.5 5" strokeLinecap="round" />
        <path d="M15.5 4.2c1.6.5 2.7 2 2.7 3.8s-1.1 3.3-2.7 3.8" strokeLinecap="round" />
        <path d="M17 14.7c2.1.5 3.7 2.1 4.5 4.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Users",
    roles: ["SUPERADMIN"],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8.5" cy="8" r="3.2" />
        <path d="M2.5 19c1.2-3.2 3.8-5 6-5s4.8 1.8 6 5" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" />
        <path d="M15.2 14.3c2.4.4 4.4 2 5.3 4.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2.05 2.05 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.6a2.05 2.05 0 1 1-4.1 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2.05 2.05 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.4a2.05 2.05 0 1 1 0-4.1h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.05 2.05 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1-1.55V4.4a2.05 2.05 0 1 1 4.1 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.05 2.05 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.55 1h.09a2.05 2.05 0 1 1 0 4.1h-.09a1.7 1.7 0 0 0-1.55 1z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-none flex-col gap-6 overflow-y-auto border-r border-border bg-surface px-4 py-6 max-[860px]:static max-[860px]:h-auto max-[860px]:w-full max-[860px]:flex-row max-[860px]:items-center max-[860px]:overflow-x-auto max-[860px]:overflow-y-visible max-[860px]:py-3">
      <div className="flex items-center gap-2.5 px-2">
        <img src="/logo.png" alt="" className="h-8 w-8 flex-none rounded-lg" />
        <span className="text-[15px] font-bold text-ink">VR Instant Fill</span>
      </div>
      <nav className="flex flex-col gap-1 max-[860px]:flex-row">
        {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-[14px] px-3 py-2.5 text-sm font-semibold text-ink-soft no-underline transition-colors duration-150 ease-in-out hover:bg-surface-muted [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:flex-none ${
                active ? "bg-primary-light text-primary-dark" : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
