import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import AddProfileForm from "./AddProfileForm";

export default async function NewProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-[22px] font-bold text-ink">New profile</h1>
        <p className="m-0 mt-1 text-[13.5px] text-ink-muted">
          The browser extension fills forms from your profiles.
        </p>
      </div>

      <AddProfileForm />
    </div>
  );
}
