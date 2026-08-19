"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type LeadEditFormProps = {
  lead: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    company: string | null;
    source: string;
    notes: string | null;
  };
};

const sources = [
  { value: "WEBSITE", label: "Website" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "GOOGLE", label: "Google" },
  { value: "REFERRAL", label: "Referral" },
  { value: "PHONE", label: "Phone" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "OTHER", label: "Other" },
];

export function LeadEditForm({ lead }: LeadEditFormProps) {
  const router = useRouter();

  const [firstName, setFirstName] = useState(lead.firstName);
  const [lastName, setLastName] = useState(lead.lastName || "");
  const [email, setEmail] = useState(lead.email || "");
  const [phone, setPhone] = useState(lead.phone || "");
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp || "");
  const [company, setCompany] = useState(lead.company || "");
  const [source, setSource] = useState(lead.source);
  const [notes, setNotes] = useState(lead.notes || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          whatsapp,
          company,
          source,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update lead.");
      }

      router.push(`/dashboard/leads/${lead.id}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update lead.",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>

              <Input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Joshua"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>

              <Input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Emmanuel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="joshua@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>

              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08012345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>

              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="2348012345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>

              <Input
                id="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="source">Lead Source</Label>

              <select
                id="source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {sources.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Additional information about this lead..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
