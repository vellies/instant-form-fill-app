import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { DynamicFieldValues } from "@/lib/profileSchema";
import ProfileForm from "./ProfileForm";

export default async function ProfileEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || (profile.userId !== user.id && user.role !== "SUPERADMIN")) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <ProfileForm
        id={profile.id}
        uniqueId={profile.uniqueId}
        profile={{ name: profile.name, email: profile.email, phone: profile.phone }}
        fields={(profile.fields as DynamicFieldValues[] | null) ?? []}
      />
    </div>
  );
}
