"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Shield, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteMemberForm } from "./invite-member-form";

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
  STAFF: "Staff",
};
const editableRoles = [
  {
    value: "STAFF",
    label: "Staff",
  },
  {
    value: "AGENT",
    label: "Agent",
  },
  {
    value: "MANAGER",
    label: "Manager",
  },
  {
    value: "ADMIN",
    label: "Admin",
  },
];
type TeamMembersProps = {
  currentUserRole: string;
};
export function TeamMembers({ currentUserRole }: TeamMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [updatedMemberId, setUpdatedMemberId] = useState<string | null>(null);
  async function loadMembers() {
    try {
      setError("");

      const response = await fetch("/api/organizations/members", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load team members.");
      }

      setMembers(data.members);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load team members.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function updateMemberRole(memberId: string, role: string) {
    setUpdatingMemberId(memberId);
    setError("");

    try {
      const response = await fetch(
        `/api/organizations/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update member role.");
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === memberId
            ? {
                ...member,
                role: data.membership.role,
              }
            : member,
        ),
      );
      // Show the success checkmark for 2 seconds.
      setUpdatedMemberId(memberId);

      setTimeout(() => {
        setUpdatedMemberId(null);
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update member role.",
      );
    } finally {
      setUpdatingMemberId(null);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  const canManageRoles =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="space-y-6">
      <InviteMemberForm
        onSuccess={() => {
          // Do NOT reload the page.
          // The invitation form keeps the generated link visible.
          loadMembers();
        }}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage the people who have access to your organization.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {members.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-7 w-7 text-primary" />
              </div>

              <h3 className="mt-4 font-semibold">No team members</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Invite people to start working with your team.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name || member.user.email}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {(member.user.name || member.user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || "Unnamed User"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  {member.role === "OWNER" || !canManageRoles ? (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      <Shield className="h-3.5 w-3.5" />

                      {roleLabels[member.role] || member.role}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {updatingMemberId === member.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}

                      {updatedMemberId === member.id && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}

                      <select
                        value={member.role}
                        disabled={updatingMemberId === member.id}
                        onChange={(event) =>
                          updateMemberRole(member.id, event.target.value)
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {editableRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
