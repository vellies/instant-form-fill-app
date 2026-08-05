import type { Role } from "@prisma/client";
import LogoutButton from "./LogoutButton";

export default function Topbar({ email, role }: { email: string; role: Role }) {
  const initial = email.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-end gap-4 border-b border-border bg-white/75 px-7 py-3.5 backdrop-blur-sm">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="badge">{role}</span>
        <div className="flex items-center gap-2">
          <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">
            {initial}
          </span>
          <span className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-ink-soft max-[860px]:hidden">
            {email}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
