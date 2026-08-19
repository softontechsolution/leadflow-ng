import { redirect } from "next/navigation";

import { getCurrentOrganization } from "@/lib/auth/organization";
import { TeamMembers } from "@/components/team/team-members";

export default async function TeamPage() {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Team</h1>

        <p className="mt-1 text-muted-foreground">
          Manage your organization and team members.
        </p>
      </div>

      <TeamMembers currentUserRole={current.membership.role} />
    </div>
  );
}
