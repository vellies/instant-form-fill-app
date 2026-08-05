import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { PROFILE_FIELDS } from "@/lib/profile";
import ProfileEditForm from "./ProfileEditForm";

export default async function EditProfilePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="m-0 text-[22px] font-bold text-ink">Edit Profile</h1>
        <p className="m-0 text-[13.5px] text-ink-muted">Owned by {profile.user.email}</p>
      </div>

      <ProfileEditForm
        profileId={profile.id}
        values={Object.fromEntries(PROFILE_FIELDS.map((field) => [field, profile[field]])) as Record<
          (typeof PROFILE_FIELDS)[number],
          string
        >}
      />
    </div>
  );
}
