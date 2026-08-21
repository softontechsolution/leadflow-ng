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
  const [error, setError] = useState("");

  async function updateStatus(
    newStatus:
      | "SCHEDULED"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED"
      | "NO_SHOW",
  ) {
    setLoading(true);
    setError("");

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update appointment.");
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update appointment.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "SCHEDULED" && (
          <Button
            size="sm"
            onClick={() => updateStatus("CONFIRMED")}
            disabled={loading}
          >
            Confirm
          </Button>
        )}

        {status === "CONFIRMED" && (
          <Button
            size="sm"
            onClick={() => updateStatus("COMPLETED")}
            disabled={loading}
          >
            Complete
          </Button>
        )}

        {(status === "SCHEDULED" || status === "CONFIRMED") && (
          <>
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
          </>
        )}

        {(status === "COMPLETED" ||
          status === "CANCELLED" ||
          status === "NO_SHOW") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus("SCHEDULED")}
            disabled={loading}
          >
            Reopen
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
