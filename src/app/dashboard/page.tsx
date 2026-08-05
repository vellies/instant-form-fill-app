import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "SUPERADMIN") {
    const [totalUsers, superadmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SUPERADMIN" } }),
    ]);

    return (
      <div className="flex flex-col gap-5">
        <h1 className="m-0 text-[22px] font-bold text-ink">Dashboard</h1>
        <p className="m-0 text-[13.5px] text-ink-muted">
          Signed in as <strong className="text-ink-soft">{user.email}</strong>
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          <div className="card flex flex-col gap-1.5 px-[22px] py-5">
            <span className="text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">Total users</span>
            <span className="text-[28px] font-bold text-ink">{totalUsers}</span>
          </div>
          <div className="card flex flex-col gap-1.5 px-[22px] py-5">
            <span className="text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">Superadmins</span>
            <span className="text-[28px] font-bold text-ink">{superadmins}</span>
          </div>
          <div className="card flex flex-col gap-1.5 px-[22px] py-5">
            <span className="text-xs font-semibold uppercase tracking-[0.03em] text-ink-muted">Admins</span>
            <span className="text-[28px] font-bold text-ink">{totalUsers - superadmins}</span>
          </div>
        </div>

        <section className="card px-7 py-6">
          <h2 className="mb-1 text-base font-bold text-ink">User management</h2>
          <p className="mt-3 text-[13px] text-ink-muted">
            Create and review admin accounts from the{" "}
            <Link href="/dashboard/users" className="font-semibold text-primary-dark no-underline">
              Users
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[22px] font-bold text-ink">Dashboard</h1>
      <p className="m-0 text-[13.5px] text-ink-muted">
        Signed in as <strong className="text-ink-soft">{user.email}</strong>
      </p>

      <section className="card px-7 py-6">
        <h2 className="mb-1 text-base font-bold text-ink">Your profile</h2>
        <p className="mt-3 text-[13px] text-ink-muted">
          Keep your profile up to date from the{" "}
          <Link href="/dashboard/profile" className="font-semibold text-primary-dark no-underline">
            Profile
          </Link>{" "}
          page — it&apos;s what the browser extension fills in for you.
        </p>
      </section>
    </div>
  );
}
