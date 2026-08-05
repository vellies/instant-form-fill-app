import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import ApiKeyCard from "./ApiKeyCard";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[22px] font-bold text-ink">Settings</h1>
      <p className="m-0 text-[13.5px] text-ink-muted">Manage your account, extension API key, and password.</p>

      <section className="card px-7 py-6">
        <h2 className="mb-4 text-[15px] font-bold text-ink">Account</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-3.5">
          <div className="field mb-0">
            <label>Email</label>
            <p className="m-0 text-sm text-ink">{user.email}</p>
          </div>
          <div className="field mb-0">
            <label>Role</label>
            <span className="inline-block w-fit rounded-full bg-primary-light px-2 py-0.5 text-[11.5px] font-semibold text-primary-dark">
              {user.role}
            </span>
          </div>
        </div>
      </section>

      <ApiKeyCard initialApiKey={user.apiKey} />

      <ChangePasswordForm />
    </div>
  );
}
