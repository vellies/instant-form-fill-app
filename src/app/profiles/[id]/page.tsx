import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { PROFILE_FIELDS } from "@/lib/profile";
import ProfileForm from "./ProfileForm";

export default async function ProfileEditPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({ where: { id: params.id } });
  if (!profile || (profile.userId !== user.id && user.role !== "SUPERADMIN")) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <ProfileForm
        id={profile.id}
        uniqueId={profile.uniqueId}
        profile={Object.fromEntries(PROFILE_FIELDS.map((field) => [field, profile[field]])) as Record<
          (typeof PROFILE_FIELDS)[number],
          string
        >}
      />
    </div>
  );
}
