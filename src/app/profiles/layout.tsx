import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell email={user.email} role={user.role}>
      {children}
    </DashboardShell>
  );
}
