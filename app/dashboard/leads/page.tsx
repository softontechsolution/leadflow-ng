import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default async function LeadsPage() {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const leads = await prisma.lead.findMany({
    where: {
      organizationId: current.organization.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Leads
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage your prospects and sales pipeline.
          </p>
        </div>

        <Link
          href="/dashboard/leads/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads ({leads.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {leads.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>

              <h3 className="mt-4 font-semibold">No leads yet</h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add your first lead to start managing your sales pipeline.
              </p>

              <Link
                href="/dashboard/leads/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Lead</th>

                    <th className="px-4 py-3 font-medium">Contact</th>

                    <th className="px-4 py-3 font-medium">Source</th>

                    <th className="px-4 py-3 font-medium">Status</th>

                    <th className="px-4 py-3 font-medium">Added</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div>
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="font-medium hover:underline"
                          >
                            {lead.firstName} {lead.lastName || ""}
                          </Link>

                          {lead.company && (
                            <p className="text-xs text-muted-foreground">
                              {lead.company}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {lead.email && <p>{lead.email}</p>}

                          {lead.phone && (
                            <p className="text-xs text-muted-foreground">
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {sourceLabels[lead.source] || lead.source}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                        }).format(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
