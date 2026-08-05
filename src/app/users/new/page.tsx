import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import AddUserForm from "./AddUserForm";

export default async function NewUserPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-[22px] font-bold text-ink">Add user</h1>
        <p className="m-0 mt-1 text-[13.5px] text-ink-muted">Create a new admin or superadmin account.</p>
      </div>

      <section className="card max-w-md px-7 py-6">
        <AddUserForm />
      </section>
    </div>
  );
}
