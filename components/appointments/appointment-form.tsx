"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LeadOption = {
  id: string;
  firstName: string;
  lastName: string | null;
  company: string | null;
};

type AppointmentFormProps = {
  leads: LeadOption[];
};

export function AppointmentForm({ leads }: AppointmentFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [status, setStatus] = useState("SCHEDULED");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          leadId: leadId || null,
          startAt,
          endAt,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create appointment.");
        return;
      }

      router.push("/dashboard/appointments");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="appointment-title">Appointment title</Label>

        <Input
          id="appointment-title"
          placeholder="Client consultation"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="appointment-lead">Lead</Label>

        <select
          id="appointment-lead"
          value={leadId}
          onChange={(event) => setLeadId(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">No lead / General appointment</option>

          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.firstName} {lead.lastName || ""}
              {lead.company ? ` — ${lead.company}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appointment-start">Start date & time</Label>

          <Input
            id="appointment-start"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment-end">End date & time</Label>

          <Input
            id="appointment-end"
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appointment-status">Status</Label>

        <select
          id="appointment-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appointment-description">Description</Label>

        <textarea
          id="appointment-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this appointment about?"
          rows={5}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Appointment"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/appointments")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
