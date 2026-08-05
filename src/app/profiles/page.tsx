import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import ProfilesToolbar from "./ProfilesToolbar";
import ProfilesTable from "./ProfilesTable";

export default async function ProfilesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-[22px] font-bold text-ink">Profiles</h1>
          <p className="m-0 mt-1 text-[13.5px] text-ink-muted">
            Manage the profiles the browser extension can fill forms from.
          </p>
        </div>
        <ProfilesToolbar />
      </div>

      <section className="card px-7 py-6">
        <ProfilesTable
          profiles={profiles.map((p) => ({
            id: p.id,
            uniqueId: p.uniqueId,
            name: p.name,
            email: p.email,
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
