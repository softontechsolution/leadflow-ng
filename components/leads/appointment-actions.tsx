"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type AppointmentActionsProps = {
  id: string;
  status: string;
};

export function AppointmentActions({ id, status }: AppointmentActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function updateStatus(
    newStatus:
      | "SCHEDULED"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED"
      | "NO_SHOW",
  ) {
    setLoading(true);

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || "Unable to update appointment.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "SCHEDULED") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading}
        >
          {loading ? "Updating..." : "Confirm"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => updateStatus("COMPLETED")}
          disabled={loading}
        >
          {loading ? "Updating..." : "Complete"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("NO_SHOW")}
          disabled={loading}
        >
          No Show
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "NO_SHOW"
  ) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => updateStatus("SCHEDULED")}
        disabled={loading}
      >
        {loading ? "Updating..." : "Reopen"}
      </Button>
    );
  }

  return null;
}
