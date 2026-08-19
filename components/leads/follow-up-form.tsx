"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FollowUpFormProps = {
  leadId: string;
};

export function FollowUpForm({ leadId }: FollowUpFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/follow-ups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          title,
          notes,
          scheduledAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to schedule follow-up.");
        return;
      }

      setTitle("");
      setNotes("");
      setScheduledAt("");

      setSuccess("Follow-up scheduled successfully.");

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="followup-title">Follow-up title</Label>

        <Input
          id="followup-title"
          placeholder="Call John about proposal"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="followup-date">Date & time</Label>

        <Input
          id="followup-date"
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="followup-notes">Notes</Label>

        <textarea
          id="followup-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What should you discuss?"
          rows={4}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Follow-up"}
      </Button>
    </form>
  );
}
