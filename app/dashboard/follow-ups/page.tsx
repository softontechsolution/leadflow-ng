import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock3, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpActions } from "@/components/leads/follow-up-actions";

export default async function FollowUpsPage() {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const organizationId = current.organization.id;

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const followUps = await prisma.followUp.findMany({
    where: {
      organizationId,
      status: "PENDING",
    },

    include: {
      lead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          whatsapp: true,
          company: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      scheduledAt: "asc",
    },
  });

  const overdue = followUps.filter(
    (followUp) => followUp.scheduledAt < startOfToday,
  );

  const today = followUps.filter(
    (followUp) =>
      followUp.scheduledAt >= startOfToday &&
      followUp.scheduledAt <= endOfToday,
  );

  const upcoming = followUps.filter(
    (followUp) => followUp.scheduledAt > endOfToday,
  );

  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      timeStyle: "short",
    }).format(date);

  const getLeadName = (followUp: (typeof followUps)[number]) =>
    `${followUp.lead.firstName} ${followUp.lead.lastName || ""}`.trim();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Follow-ups
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage your scheduled customer follow-ups and stay on top of
              pending tasks.
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Clock3 className="h-5 w-5 text-destructive" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>

              <p className="text-2xl font-bold">{overdue.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Today</p>

              <p className="text-2xl font-bold">{today.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>

              <p className="text-2xl font-bold">{upcoming.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OVERDUE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Overdue Follow-ups</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              These follow-ups were scheduled before today and still need
              attention.
            </p>
          </div>

          <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
            {overdue.length}
          </span>
        </CardHeader>

        <CardContent>
          {overdue.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">No overdue follow-ups</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Great job. You are all caught up.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdue.map((followUp) => (
                <div
                  key={followUp.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/leads/${followUp.lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {followUp.title}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getLeadName(followUp)}
                      </p>

                      {followUp.lead.company && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {followUp.lead.company}
                        </p>
                      )}

                      <p className="mt-2 text-xs font-medium text-destructive">
                        Due {formatDateTime(followUp.scheduledAt)}
                      </p>

                      {followUp.user && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned to{" "}
                          {followUp.user.name || followUp.user.email}
                        </p>
                      )}

                      {followUp.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                          {followUp.notes}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <FollowUpActions
                        id={followUp.id}
                        status={followUp.status}
                      />
                    </div>
                  </div>
                </div>
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
              Follow-ups scheduled for today.
            </p>
          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {today.length}
          </span>
        </CardHeader>

        <CardContent>
          {today.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No follow-ups scheduled for today
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                You have nothing scheduled for today.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {today.map((followUp) => (
                <div
                  key={followUp.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/leads/${followUp.lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {followUp.title}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getLeadName(followUp)}
                      </p>

                      {followUp.lead.company && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {followUp.lead.company}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-semibold">
                          {formatTime(followUp.scheduledAt)}
                        </span>

                        {followUp.user && (
                          <span className="text-muted-foreground">
                            Assigned to{" "}
                            {followUp.user.name || followUp.user.email}
                          </span>
                        )}
                      </div>

                      {followUp.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                          {followUp.notes}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <FollowUpActions
                        id={followUp.id}
                        status={followUp.status}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPCOMING */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Follow-ups</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Follow-ups scheduled after today.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
            {upcoming.length}
          </span>
        </CardHeader>

        <CardContent>
          {upcoming.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">No upcoming follow-ups</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Schedule a follow-up from a lead's profile.
              </p>

              <Link
                href="/dashboard/leads"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Users className="mr-2 h-4 w-4" />
                View Leads
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((followUp) => (
                <div
                  key={followUp.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/leads/${followUp.lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {followUp.title}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getLeadName(followUp)}
                      </p>

                      {followUp.lead.company && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {followUp.lead.company}
                        </p>
                      )}

                      <p className="mt-2 text-xs font-medium">
                        Scheduled for {formatDateTime(followUp.scheduledAt)}
                      </p>

                      {followUp.user && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned to{" "}
                          {followUp.user.name || followUp.user.email}
                        </p>
                      )}

                      {followUp.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                          {followUp.notes}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <FollowUpActions
                        id={followUp.id}
                        status={followUp.status}
                      />
                    </div>
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
