import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function FollowUpSummary() {
  const current = await getCurrentOrganization();

  if (!current) {
    return null;
  }

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const followUps = await prisma.followUp.findMany({
    where: {
      organizationId: current.organization.id,

      status: "PENDING",

      scheduledAt: {
        lt: endOfToday,
      },
    },

    include: {
      lead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          whatsapp: true,
        },
      },
    },

    orderBy: {
      scheduledAt: "asc",
    },

    take: 10,
  });

  const today = followUps.filter(
    (followUp) =>
      followUp.scheduledAt >= startOfToday &&
      followUp.scheduledAt <= endOfToday,
  );

  const overdue = followUps.filter(
    (followUp) => followUp.scheduledAt < startOfToday,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* OVERDUE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Overdue Follow-ups</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Follow-ups that need your attention.
            </p>
          </div>

          <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
            {overdue.length}
          </span>
        </CardHeader>

        <CardContent>
          {overdue.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                🎉 No overdue follow-ups.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdue.map((followUp) => (
                <Link
                  key={followUp.id}
                  href={`/dashboard/leads/${followUp.lead.id}`}
                  className="block rounded-lg border p-4 transition hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{followUp.title}</p>

                      <p className="text-sm text-muted-foreground">
                        {followUp.lead.firstName} {followUp.lead.lastName}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-destructive">
                      Overdue
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Due{" "}
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(followUp.scheduledAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODAY */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Follow-ups</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Your follow-ups scheduled for today.
            </p>
          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold">
            {today.length}
          </span>
        </CardHeader>

        <CardContent>
          {today.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No follow-ups scheduled for today.
              </p>

              <Link href="/dashboard/leads">
                <Button variant="outline">View Leads</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {today.map((followUp) => (
                <Link
                  key={followUp.id}
                  href={`/dashboard/leads/${followUp.lead.id}`}
                  className="block rounded-lg border p-4 transition hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{followUp.title}</p>

                      <p className="text-sm text-muted-foreground">
                        {followUp.lead.firstName} {followUp.lead.lastName}
                      </p>
                    </div>

                    <span className="text-xs font-medium">
                      {new Intl.DateTimeFormat("en-NG", {
                        timeStyle: "short",
                      }).format(followUp.scheduledAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
