import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import ProfilesToolbar from "./ProfilesToolbar";
import ProfilesTable from "./ProfilesTable";
import MyProfilesTable from "./MyProfilesTable";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "SUPERADMIN") {
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
          <Link href="/profiles/new" className="btn-primary whitespace-nowrap no-underline">
            + New Profile
          </Link>
        </div>

        <section className="card px-7 py-6">
          <MyProfilesTable
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

  const query = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { uniqueId: { contains: query, mode: "insensitive" as const } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [total, profiles] = await Promise.all([
    prisma.profile.count({ where }),
    prisma.profile.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-[22px] font-bold text-ink">Profiles</h1>
        <p className="m-0 mt-1 text-[13.5px] text-ink-muted">
          Browse and manage every admin's profiles across the organization.
        </p>
      </div>

      <ProfilesToolbar />

      <section className="card px-7 py-6">
        <ProfilesTable
          profiles={profiles.map((p) => ({
            id: p.id,
            uniqueId: p.uniqueId,
            name: p.name,
            email: p.email,
            ownerEmail: p.user.email,
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
        </div>
      </section>
    </div>
  );
}
