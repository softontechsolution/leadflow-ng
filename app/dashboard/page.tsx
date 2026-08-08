import { Users, UserPlus, CalendarClock, Trophy } from "lucide-react";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { StatCard } from "@/components/dashboard/stat-card";

export default async function DashboardPage() {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const organizationId = current.organization.id;

  const [totalLeads, newLeads, pendingFollowUps, wonLeads, recentLeads] =
    await Promise.all([
      prisma.lead.count({
        where: {
          organizationId,
        },
      }),

      prisma.lead.count({
        where: {
          organizationId,
          status: "NEW",
        },
      }),

      prisma.followUp.count({
        where: {
          organizationId,
          status: "PENDING",
        },
      }),

      prisma.lead.count({
        where: {
          organizationId,
          status: "WON",
        },
      }),

      prisma.lead.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          source: true,
          createdAt: true,
        },
      }),
    ]);

  const firstName = current.user.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">
          Welcome back, {firstName}
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-muted-foreground">
          Here's what's happening with {current.organization.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          description="All leads in your pipeline"
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="New Leads"
          value={newLeads}
          description="Leads waiting for contact"
          icon={<UserPlus className="h-5 w-5" />}
        />

        <StatCard
          title="Follow-ups"
          value={pendingFollowUps}
          description="Pending follow-ups"
          icon={<CalendarClock className="h-5 w-5" />}
        />

        <StatCard
          title="Won Deals"
          value={wonLeads}
          description="Successfully converted"
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>

        <CardContent>
          {recentLeads.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">No leads yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your newest leads will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {lead.firstName} {lead.lastName || ""}
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {lead.email || lead.phone || "No contact information"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {lead.status.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
