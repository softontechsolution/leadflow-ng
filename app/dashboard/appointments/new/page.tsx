import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default async function NewAppointmentPage() {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const leads = await prisma.lead.findMany({
    where: {
      organizationId: current.organization.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      company: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/appointments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Appointments
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          New Appointment
        </h1>

        <p className="mt-1 text-muted-foreground">
          Schedule a meeting, consultation or appointment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>

        <CardContent>
          <AppointmentForm leads={leads} />
        </CardContent>
      </Card>
    </div>
  );
}
