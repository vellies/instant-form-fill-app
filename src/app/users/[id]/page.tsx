import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import EditUserForm from "./EditUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }
  if (id === user.id) {
    redirect("/users");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-[22px] font-bold text-ink">Edit user</h1>
        <p className="m-0 mt-1 text-[13.5px] text-ink-muted">{target.email}</p>
      </div>

      <section className="card max-w-md px-7 py-6">
        <EditUserForm id={target.id} role={target.role} />
      </section>
    </div>
  );
}
