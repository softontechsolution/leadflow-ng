"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteToken = searchParams.get("invite");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(
    Boolean(inviteToken),
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load invitation details when registering through an invitation.
   */
  useEffect(() => {
    if (!inviteToken) {
      setLoadingInvitation(false);
      return;
    }

    async function loadInvitation() {
      try {
        const response = await fetch(
          `/api/organizations/invitations/${inviteToken}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load invitation.");
        }

        setInvitation(data.invitation);

        /*
         * Pre-fill the invited email.
         */
        setEmail(data.invitation.email);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load invitation.",
        );
      } finally {
        setLoadingInvitation(false);
      }
    }

    loadInvitation();
  }, [inviteToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!inviteToken && !businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    /*
     * If this is an invitation registration,
     * make sure the email matches the invitation.
     */
    if (
      invitation &&
      email.trim().toLowerCase() !== invitation.email.toLowerCase()
    ) {
      setError(
        `This invitation was sent to ${invitation.email}. Please use that email address.`,
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Create the authentication account.
       */
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        callbackURL: inviteToken ? `/invite/${inviteToken}` : "/dashboard",
      });

      if (error) {
        setError(error.message || "Unable to create your account.");
        return;
      }

      if (!data?.user) {
        setError("Account creation failed. Please try again.");
        return;
      }

      /*
       * INVITATION REGISTRATION
       *
       * Do NOT create a new organization.
       *
       * Instead, accept the invitation for the newly
       * created user.
       */
      if (inviteToken) {
        const acceptResponse = await fetch(
          `/api/organizations/invitations/${inviteToken}/accept`,
          {
            method: "POST",
          },
        );

        const acceptData = await acceptResponse.json();

        if (!acceptResponse.ok) {
          setError(
            acceptData.error ||
              "Your account was created, but we could not accept the invitation.",
          );

          return;
        }

        router.push("/dashboard");
        router.refresh();

        return;
      }

      /*
       * NORMAL REGISTRATION
       *
       * Create a new organization and make this user
       * the OWNER.
       */
      const organizationResponse = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: businessName.trim(),
        }),
      });

      const organizationData = await organizationResponse.json();

      if (!organizationResponse.ok) {
        setError(
          organizationData.error ||
            "Your account was created, but we could not create your business workspace.",
        );

        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingInvitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-muted-foreground">Loading invitation...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">
            {invitation
              ? `Join ${invitation.organization.name}`
              : "Create your LeadFlow account"}
          </CardTitle>

          <CardDescription>
            {invitation
              ? `You've been invited to join ${invitation.organization.name} as a ${
                  roleLabels[invitation.role] || invitation.role
                }.`
              : "Start managing your leads, customers and follow-ups in one place."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitation && (
            <div className="mb-5 rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Invitation email</p>

              <p className="mt-1 text-sm font-medium">{invitation.email}</p>

              <p className="mt-2 text-xs text-muted-foreground">
                Role:{" "}
                <span className="font-medium text-foreground">
                  {roleLabels[invitation.role] || invitation.role}
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>

              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            {!inviteToken && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>

                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="Acme Realty"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  disabled={loading}
                  autoComplete="organization"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading || Boolean(invitation)}
                autoComplete="email"
              />

              {invitation && (
                <p className="text-xs text-muted-foreground">
                  This email is locked to the invitation.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Creating account..."
                : invitation
                  ? "Create Account & Join Team"
                  : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={
                  inviteToken
                    ? `/login?redirect=/invite/${inviteToken}`
                    : "/login"
                }
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
