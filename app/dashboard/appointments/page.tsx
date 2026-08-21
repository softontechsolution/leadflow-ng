import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  UserRound,
} from "lucide-react";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActions } from "@/components/appointments/appointment-actions";

const statusLabels: Record<string, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

type AppointmentsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const params = await searchParams;

  const status = typeof params.status === "string" ? params.status : "";

  const validStatuses = [
    "SCHEDULED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ];

  const validStatus = validStatuses.includes(status) ? status : undefined;

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const [todayAppointments, upcomingAppointments, counts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        organizationId: current.organization.id,

        startAt: {
          gte: startOfToday,
          lte: endOfToday,
        },

        ...(validStatus
          ? {
              status: validStatus as
                | "SCHEDULED"
                | "CONFIRMED"
                | "COMPLETED"
                | "CANCELLED"
                | "NO_SHOW",
            }
          : {}),
      },

      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },

        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        startAt: "asc",
      },
    }),

    prisma.appointment.findMany({
      where: {
        organizationId: current.organization.id,

        startAt: {
          gt: endOfToday,
        },

        status: {
          notIn: ["CANCELLED", "COMPLETED", "NO_SHOW"],
        },
      },

      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },

        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        startAt: "asc",
      },

      take: 20,
    }),

    Promise.all([
      prisma.appointment.count({
        where: {
          organizationId: current.organization.id,
          startAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      prisma.appointment.count({
        where: {
          organizationId: current.organization.id,
          status: "SCHEDULED",
        },
      }),

      prisma.appointment.count({
        where: {
          organizationId: current.organization.id,
          status: "CONFIRMED",
        },
      }),

      prisma.appointment.count({
        where: {
          organizationId: current.organization.id,
          status: "COMPLETED",
        },
      }),
    ]),
  ]);

  const [todayCount, scheduledCount, confirmedCount, completedCount] = counts;

  function getPersonName(appointment: {
    lead: {
      firstName: string;
      lastName: string | null;
      company: string | null;
    } | null;
    customer: {
      firstName: string;
      lastName: string | null;
    } | null;
  }) {
    if (appointment.lead) {
      return `${appointment.lead.firstName} ${
        appointment.lead.lastName || ""
      }`.trim();
    }

    if (appointment.customer) {
      return `${appointment.customer.firstName} ${
        appointment.customer.lastName || ""
      }`.trim();
    }

    return "No contact";
  }

  function getPersonLink(appointment: {
    lead: {
      id: string;
    } | null;
  }) {
    if (appointment.lead) {
      return `/dashboard/leads/${appointment.lead.id}`;
    }

    return null;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Appointments
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage your meetings, consultations and scheduled appointments.
          </p>
        </div>

        <Link
          href="/dashboard/appointments/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          New Appointment
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-muted p-3">
              <Clock className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{scheduledCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold">{confirmedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-muted p-3">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER */}
      <Card>
        <CardContent className="pt-6">
          <form
            method="GET"
            action="/dashboard/appointments"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <select
              name="status"
              defaultValue={validStatus ?? ""}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
            >
              <option value="">All statuses</option>

              {validStatuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabels[item]}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Filter
            </button>

            {validStatus && (
              <Link
                href="/dashboard/appointments"
                className="inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-medium hover:bg-muted"
              >
                Clear
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* TODAY */}
      <Card>
        <CardHeader>
          <CardTitle>
            Today's Appointments ({todayAppointments.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No appointments today
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Appointments scheduled for today will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => {
                const personName = getPersonName(appointment);
                const personLink = getPersonLink(appointment);

                return (
                  <div
                    key={appointment.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/appointments/${appointment.id}/edit`}
                          className="font-semibold hover:text-primary hover:underline"
                        >
                          {appointment.title}
                        </Link>
                        {personLink ? (
                          <Link
                            href={personLink}
                            className="mt-1 block text-sm text-primary hover:underline"
                          >
                            {personName}
                          </Link>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {personName}
                          </p>
                        )}

                        {appointment.lead?.company && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {appointment.lead.company}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("en-NG", {
                            timeStyle: "short",
                          }).format(appointment.startAt)}
                          {" – "}
                          {new Intl.DateTimeFormat("en-NG", {
                            timeStyle: "short",
                          }).format(appointment.endAt)}
                        </p>

                        {appointment.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {appointment.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                          {statusLabels[appointment.status]}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/appointments/${appointment.id}/edit`}
                            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
                          >
                            Edit
                          </Link>

                          <AppointmentActions
                            id={appointment.id}
                            status={appointment.status}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPCOMING */}
      <Card>
        <CardHeader>
          <CardTitle>
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const personName = getPersonName(appointment);
                const personLink = getPersonLink(appointment);

                return (
                  <div key={appointment.id} className="rounded-lg border p-4">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <Link
                          href={`/dashboard/appointments/${appointment.id}/edit`}
                          className="font-semibold hover:text-primary hover:underline"
                        >
                          {appointment.title}
                        </Link>

                        {personLink ? (
                          <Link
                            href={personLink}
                            className="mt-1 block text-sm text-primary hover:underline"
                          >
                            {personName}
                          </Link>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {personName}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("en-NG", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(appointment.startAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                          {statusLabels[appointment.status]}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/appointments/${appointment.id}/edit`}
                            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
                          >
                            Edit
                          </Link>

                          <AppointmentActions
                            id={appointment.id}
                            status={appointment.status}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
