import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import ProfilesTable from "./ProfilesTable";

export default async function AllProfilesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const [profiles, users] = await Promise.all([
    prisma.profile.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[22px] font-bold text-ink">All Profiles</h1>
      <p className="m-0 text-[13.5px] text-ink-muted">
        Every autofill profile across all accounts. Create, edit, or remove any profile.
      </p>

      <ProfilesTable
        initialProfiles={profiles.map((p) => ({
          id: p.id,
          name: p.name,
          ownerEmail: p.user.email,
          updatedAt: p.updatedAt.toISOString(),
        }))}
        users={users}
      />
    </div>
  );
}
