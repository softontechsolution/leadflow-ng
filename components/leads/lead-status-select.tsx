"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
  },
  {
    value: "INTERESTED",
    label: "Interested",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-up",
  },
  {
    value: "QUALIFIED",
    label: "Qualified",
  },
  {
    value: "WON",
    label: "Won",
  },
  {
    value: "LOST",
    label: "Lost",
  },
];

type LeadStatusSelectProps = {
  leadId: string;
  currentStatus: string;
};

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: LeadStatusSelectProps) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleChange(newStatus: string) {
    if (newStatus === status) {
      return;
    }

    const previousStatus = status;

    setStatus(newStatus);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(previousStatus);

        setError(data.error || "Unable to update status.");

        return;
      }

      router.refresh();
    } catch {
      setStatus(previousStatus);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={status}
        disabled={loading}
        onChange={(event) => handleChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {loading && (
        <p className="text-xs text-muted-foreground">Updating status...</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
