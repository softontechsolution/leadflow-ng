import Link from "next/link";
import { Plus, Users, Search, X } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { redirect } from "next/navigation";

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

const statuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "WON",
  "LOST",
];

const sources = [
  "WEBSITE",
  "WHATSAPP",
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "GOOGLE",
  "REFERRAL",
  "PHONE",
  "WALK_IN",
  "OTHER",
];

type LeadsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search.trim() : "";

  const status = typeof params.status === "string" ? params.status : "";

  const source = typeof params.source === "string" ? params.source : "";

  const validStatus = statuses.includes(status) ? status : undefined;

  const validSource = sources.includes(source) ? source : undefined;

  const leads = await prisma.lead.findMany({
    where: {
      organizationId: current.organization.id,

      ...(validStatus
        ? {
            status: validStatus as
              | "NEW"
              | "CONTACTED"
              | "INTERESTED"
              | "FOLLOW_UP"
              | "QUALIFIED"
              | "WON"
              | "LOST",
          }
        : {}),

      ...(validSource
        ? {
            source: validSource as
              | "WEBSITE"
              | "WHATSAPP"
              | "INSTAGRAM"
              | "FACEBOOK"
              | "TIKTOK"
              | "GOOGLE"
              | "REFERRAL"
              | "PHONE"
              | "WALK_IN"
              | "OTHER",
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                whatsapp: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                company: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const hasFilters =
    Boolean(search) || Boolean(validStatus) || Boolean(validSource);

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

      {/* SEARCH & FILTERS */}
      <Card>
        <CardContent className="pt-6">
          <form
            method="GET"
            action="/dashboard/leads"
            className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"
          >
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search name, email, phone or company..."
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* STATUS */}
            <select
              name="status"
              defaultValue={validStatus ?? ""}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All statuses</option>

              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabels[item]}
                </option>
              ))}
            </select>

            {/* SOURCE */}
            <select
              name="source"
              defaultValue={validSource ?? ""}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All sources</option>

              {sources.map((item) => (
                <option key={item} value={item}>
                  {sourceLabels[item]}
                </option>
              ))}
            </select>

            {/* SEARCH BUTTON */}
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Search
            </button>
          </form>

          {/* ACTIVE FILTERS */}
          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>

              {search && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Search: {search}
                </span>
              )}

              {validStatus && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Status: {statusLabels[validStatus]}
                </span>
              )}

              {validSource && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Source: {sourceLabels[validSource]}
                </span>
              )}

              <Link
                href="/dashboard/leads"
                className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESULTS */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasFilters
              ? `Search Results (${leads.length})`
              : `All Leads (${leads.length})`}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {leads.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>

              <h3 className="mt-4 font-semibold">
                {hasFilters ? "No matching leads" : "No leads yet"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasFilters
                  ? "Try changing your search or filters."
                  : "Add your first lead to start managing your sales pipeline."}
              </p>

              {hasFilters ? (
                <Link
                  href="/dashboard/leads"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Clear filters
                </Link>
              ) : (
                <Link
                  href="/dashboard/leads/new"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first lead
                </Link>
              )}
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
