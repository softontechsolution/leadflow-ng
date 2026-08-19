"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type FollowUpActionsProps = {
  id: string;
  status: string;
};

export function FollowUpActions({ id, status }: FollowUpActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function updateStatus(
    newStatus: "COMPLETED" | "CANCELLED" | "PENDING",
  ) {
    setLoading(true);

    try {
      const response = await fetch(`/api/follow-ups/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update follow-up.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "PENDING") {
    return (
      <div className="mt-3 flex gap-2">
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
          onClick={() => updateStatus("CANCELLED")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => updateStatus("PENDING")}
        disabled={loading}
      >
        Reopen
      </Button>
    );
  }

  return null;
}
