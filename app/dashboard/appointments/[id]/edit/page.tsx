import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentEditForm } from "@/components/appointments/appointment-edit-form";

type EditAppointmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAppointmentPage({
  params,
}: EditAppointmentPageProps) {
  const current = await getCurrentOrganization();

  if (!current) {
    redirect("/register");
  }

  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      organizationId: current.organization.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      startAt: true,
      endAt: true,
      status: true,
      leadId: true,
      customerId: true,
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
  });

  if (!appointment) {
    notFound();
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
          Edit Appointment
        </h1>

        <p className="mt-1 text-muted-foreground">
          Update the appointment details, date, time or status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>

        <CardContent>
          <AppointmentEditForm
            appointment={{
              id: appointment.id,
              title: appointment.title,
              description: appointment.description,
              startAt: appointment.startAt.toISOString(),
              endAt: appointment.endAt.toISOString(),
              status: appointment.status,
              leadId: appointment.leadId,
              customerId: appointment.customerId,
            }}
            leads={leads}
          />
        </CardContent>
      </Card>
    </div>
  );
}
