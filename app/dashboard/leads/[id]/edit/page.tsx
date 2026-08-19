import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { LeadEditForm } from "@/components/leads/lead-edit-form";

type EditLeadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditLeadPage({ params }: EditLeadPageProps) {
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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      whatsapp: true,
      company: true,
      source: true,
      notes: true,
    },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lead
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit Lead
          </h1>

          <p className="mt-1 text-muted-foreground">
            Update the contact information and details for this lead.
          </p>
        </div>
      </div>

      <LeadEditForm lead={lead} />
    </div>
  );
}
