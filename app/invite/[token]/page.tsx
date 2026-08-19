"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Mail, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Invitation = {
  email: string;
  role: string;
  expiresAt: string;
  organization: {
    name: string;
    logoUrl: string | null;
  };
  invitedBy: {
    name: string | null;
    email: string;
  };
};

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
  STAFF: "Staff",
};

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvitation() {
      try {
        const response = await fetch(`/api/organizations/invitations/${token}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load invitation.");
        }

        setInvitation(data.invitation);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load invitation.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  async function acceptInvitation() {
    setAccepting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/organizations/invitations/${token}/accept`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      /*
       * User is not logged in.
       * Send them to registration while preserving the invitation token.
       */
      if (response.status === 401 && data.requiresLogin) {
        router.push(`/register?invite=${token}`);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to accept invitation.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to accept invitation.",
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation unavailable</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>

            <Button className="mt-6 w-full" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>

          <CardTitle className="text-2xl">You&apos;re invited</CardTitle>

          <p className="mt-2 text-sm text-muted-foreground">
            Join {invitation.organization.name} on LeadFlow.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />

              <div>
                <p className="text-xs text-muted-foreground">Invited email</p>

                <p className="text-sm font-medium">{invitation.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">Your role</p>

            <p className="mt-1 font-medium">
              {roleLabels[invitation.role] || invitation.role}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Invited by{" "}
            <span className="font-medium text-foreground">
              {invitation.invitedBy.name || invitation.invitedBy.email}
            </span>
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            onClick={acceptInvitation}
            disabled={accepting}
          >
            {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Invitation
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
