import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Pencil,
  UserRound,
} from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusSelect } from "@/components/leads/lead-status-select";

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  QUALIFIED: "Qualified",
  WON: "Won",
  LOST: "Lost",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  GOOGLE: "Google",
  REFERRAL: "Referral",
  PHONE: "Phone",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

type LeadDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailsPage({
  params,
}: LeadDetailsPageProps) {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const { id } = await params;

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      organizationId: current.organization.id,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      activities: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      followUps: {
        orderBy: {
          scheduledAt: "asc",
        },
        take: 5,
      },
      appointments: {
        orderBy: {
          startAt: "asc",
        },
        take: 5,
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const fullName = `${lead.firstName} ${lead.lastName || ""}`.trim();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-7 w-7 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {fullName}
            </h1>

            {lead.company && (
              <p className="mt-1 text-muted-foreground">{lead.company}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {statusLabels[lead.status] || lead.status}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {sourceLabels[lead.source] || lead.source}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/leads/${lead.id}/edit`}
          className="inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Lead
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <Mail className="h-5 w-5 text-primary" />

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>

                    <p className="truncate text-sm font-medium">{lead.email}</p>
                  </div>
                </a>
              )}

              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <Phone className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>

                    <p className="text-sm font-medium">{lead.phone}</p>
                  </div>
                </a>
              )}

              {lead.whatsapp && (
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <MessageCircle className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>

                    <p className="text-sm font-medium">{lead.whatsapp}</p>
                  </div>
                </a>
              )}

              {lead.company && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Company</p>

                  <p className="mt-1 text-sm font-medium">{lead.company}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>

            <CardContent>
              {lead.notes ? (
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {lead.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes have been added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>

            <CardContent>
              {lead.activities.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm font-medium">No activity yet</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Lead interactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="relative border-l pl-6">
                      <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />

                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.type.replace("_", " ")} ·{" "}
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(activity.createdAt)}
                      </p>

                      {activity.user && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          By {activity.user.name || activity.user.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Status</p>

                <LeadStatusSelect
                  leadId={lead.id}
                  currentStatus={lead.status}
                />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Source</p>

                <p className="mt-1 text-sm font-medium">
                  {sourceLabels[lead.source] || lead.source}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Assigned to</p>

                <p className="mt-1 text-sm font-medium">
                  {lead.assignedTo?.name ||
                    lead.assignedTo?.email ||
                    "Unassigned"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created</p>

                <p className="mt-1 text-sm font-medium">
                  {new Intl.DateTimeFormat("en-NG", {
                    dateStyle: "medium",
                  }).format(lead.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-ups</CardTitle>
            </CardHeader>

            <CardContent>
              {lead.followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No follow-ups scheduled.
                </p>
              ) : (
                <div className="space-y-3">
                  {lead.followUps.map((followUp) => (
                    <div key={followUp.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{followUp.title}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(followUp.scheduledAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>

            <CardContent>
              {lead.appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No appointments scheduled.
                </p>
              ) : (
                <div className="space-y-3">
                  {lead.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{appointment.title}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(appointment.startAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
