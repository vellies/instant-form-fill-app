import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const query = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = query ? { email: { contains: query, mode: "insensitive" as const } } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, email: true, role: true, emailVerified: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[22px] font-bold text-ink">Users</h1>
      <p className="m-0 text-[13.5px] text-ink-muted">Manage admin and superadmin accounts.</p>

      <UsersToolbar />

      <section className="card px-7 py-6">
        <UsersTable
          users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={user.id}
        />
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
        </div>
      </section>
    </div>
  );
}
