import type { Role } from "@prisma/client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({
  email,
  role,
  children,
}: {
  email: string;
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen max-[860px]:flex-col">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={email} role={role} />
        <main className="flex-1 p-7 max-[860px]:p-5">{children}</main>
      </div>
    </div>
  );
}
