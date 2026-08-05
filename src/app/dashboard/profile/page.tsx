import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { PROFILE_FIELDS } from "@/lib/profile";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findFirst({ where: { userId: user.id } });

  return (
    <div className="flex flex-col gap-5">
      {profile ? (
        <ProfileForm
          profile={Object.fromEntries(PROFILE_FIELDS.map((field) => [field, profile[field]])) as Record<
            (typeof PROFILE_FIELDS)[number],
            string
          >}
        />
      ) : (
        <section className="card px-7 py-6">
          <p className="text-[13px] text-ink-muted">No profile found for your account yet.</p>
        </section>
      )}
    </div>
  );
}
