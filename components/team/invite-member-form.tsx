"use client";

import { useState } from "react";
import { Check, Copy, Loader2, UserPlus, X } from "lucide-react";

const roles = [
  { value: "STAFF", label: "Staff" },
  { value: "AGENT", label: "Agent" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

type InviteMemberFormProps = {
  onSuccess?: () => void;
};

export function InviteMemberForm({ onSuccess }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setInvitationUrl("");
    setCopied(false);

    try {
      const response = await fetch("/api/organizations/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create invitation.");
      }

      setInvitationUrl(data.invitation.invitationUrl);
      setEmail("");
      setRole("STAFF");

      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create invitation.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyInvitationLink() {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy invitation link.");
    }
  }

  function dismissInvitation() {
    setInvitationUrl("");
    setCopied(false);
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4" />
          Invite Team Member
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Send an invitation to someone you want to add to your organization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="invite-email"
            className="mb-1.5 block text-sm font-medium"
          >
            Email address
          </label>

          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="member@example.com"
            required
            disabled={loading}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="invite-role"
            className="mb-1.5 block text-sm font-medium"
          >
            Role
          </label>

          <select
            id="invite-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {invitationUrl && (
          <div className="relative rounded-md border border-green-500/30 bg-green-500/10 p-3">
            <button
              type="button"
              onClick={dismissInvitation}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Dismiss invitation"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="pr-8 text-sm font-medium">
              Invitation created successfully.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Share this invitation link with the team member. The link expires
              in 7 days.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1 break-all rounded bg-background p-2 text-xs">
                {invitationUrl}
              </div>

              <button
                type="button"
                onClick={copyInvitationLink}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating invitation...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Invitation
            </>
          )}
        </button>
      </form>
    </div>
  );
}
