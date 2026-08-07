import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import ProfilesToolbar from "./ProfilesToolbar";
import ProfilesTable from "./ProfilesTable";
import MyProfilesTable from "./MyProfilesTable";
import Pagination from "./Pagination";
import PostActionToast from "./PostActionToast";

const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_PAGE_SIZES = [5, 10, 30, 50, 75, 100] as const;

function resolvePageSize(raw: string | undefined): number {
  const n = Number(raw);
  return (ALLOWED_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const { q, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = resolvePageSize(pageSizeParam);

  if (user.role !== "SUPERADMIN") {
    const where = {
      userId: user.id,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query, mode: "insensitive" as const } },
              { uniqueId: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, profiles] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
      <div className="flex flex-col gap-5">
        <PostActionToast />
        <div>
          <h1 className="m-0 text-[22px] font-bold text-ink">Profiles</h1>
          <p className="m-0 mt-1 text-[13.5px] text-ink-muted">
            Manage the profiles the browser extension can fill forms from.
          </p>
        </div>

        <ProfilesToolbar placeholder="Search profiles by name, email, phone, or ID..." />

        <section className="card px-7 py-6">
          <MyProfilesTable
            profiles={profiles.map((p) => ({
              id: p.id,
              uniqueId: p.uniqueId,
              name: p.name,
              email: p.email,
              phone: p.phone,
              updatedAt: p.updatedAt.toISOString(),
            }))}
          />
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              pageSizeOptions={ALLOWED_PAGE_SIZES}
            />
          </div>
        </section>
      </div>
    );
  }

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } },
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-5">
      <PostActionToast />
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
            phone: p.phone,
            ownerEmail: p.user.email,
            updatedAt: p.updatedAt.toISOString(),
          }))}
        />
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={ALLOWED_PAGE_SIZES}
          />
        </div>
      </section>
    </div>
  );
}
