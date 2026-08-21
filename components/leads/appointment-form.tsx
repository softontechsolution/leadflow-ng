"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AppointmentFormProps = {
  leadId: string;
};

export function AppointmentForm({ leadId }: AppointmentFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Appointment title is required.");
      setLoading(false);
      return;
    }

    if (!startAt || !endAt) {
      setError("Start and end date/time are required.");
      setLoading(false);
      return;
    }

    if (new Date(endAt) <= new Date(startAt)) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          startAt,
          endAt,
          leadId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to schedule appointment.");
        return;
      }

      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");

      setSuccess("Appointment scheduled successfully.");

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
        <Label htmlFor="appointment-title">Appointment title</Label>

        <Input
          id="appointment-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Meeting with John"
          disabled={loading}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appointment-start">Start date & time</Label>

          <Input
            id="appointment-start"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            disabled={loading}
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
            disabled={loading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appointment-description">Description</Label>

        <Textarea
          id="appointment-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this appointment about?"
          rows={4}
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Appointment"}
      </Button>
    </form>
  );
}
