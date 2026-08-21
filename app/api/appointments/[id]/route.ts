import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const validStatuses = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

type AppointmentStatus = (typeof validStatuses)[number];

type AppointmentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

export async function PATCH(
  request: Request,
  { params }: AppointmentRouteProps,
) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        organizationId: current.organization.id,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : appointment.title;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : appointment.description;

    const startAt =
      typeof body.startAt === "string"
        ? body.startAt
        : appointment.startAt.toISOString();

    const endAt =
      typeof body.endAt === "string"
        ? body.endAt
        : appointment.endAt.toISOString();

    const status =
      typeof body.status === "string" ? body.status : appointment.status;

    if (!title) {
      return NextResponse.json(
        { error: "Appointment title is required." },
        { status: 400 },
      );
    }

    if (!validStatuses.includes(status as AppointmentStatus)) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 },
      );
    }

    const newStartDate = new Date(startAt);
    const newEndDate = new Date(endAt);

    if (
      Number.isNaN(newStartDate.getTime()) ||
      Number.isNaN(newEndDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid appointment date or time." },
        { status: 400 },
      );
    }

    if (newEndDate <= newStartDate) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 },
      );
    }

    const statusChanged = appointment.status !== status;

    const timeChanged =
      appointment.startAt.getTime() !== newStartDate.getTime() ||
      appointment.endAt.getTime() !== newEndDate.getTime();

    const titleChanged = appointment.title !== title;

    const descriptionChanged =
      appointment.description !== (description || null);

    const activities: string[] = [];

    /*
     * STATUS CHANGE
     */
    if (statusChanged) {
      switch (status) {
        case "CONFIRMED":
          activities.push(`Appointment confirmed: "${title}".`);
          break;

        case "COMPLETED":
          activities.push(`Appointment completed: "${title}".`);
          break;

        case "CANCELLED":
          activities.push(`Appointment cancelled: "${title}".`);
          break;

        case "NO_SHOW":
          activities.push(`Appointment marked as no-show: "${title}".`);
          break;

        case "SCHEDULED":
          activities.push(`Appointment reopened: "${title}".`);
          break;

        default:
          activities.push(
            `Appointment status changed from ${appointment.status} to ${status}: "${title}".`,
          );
      }
    }

    /*
     * RESCHEDULE
     */
    if (timeChanged) {
      const oldStart = dateFormatter.format(appointment.startAt);
      const oldEnd = dateFormatter.format(appointment.endAt);

      const newStart = dateFormatter.format(newStartDate);
      const newEnd = dateFormatter.format(newEndDate);

      activities.push(
        `Appointment rescheduled: "${title}" from ${oldStart} – ${oldEnd} to ${newStart} – ${newEnd}.`,
      );
    }

    /*
     * TITLE CHANGE
     */
    if (titleChanged) {
      activities.push(
        `Appointment title changed from "${appointment.title}" to "${title}".`,
      );
    }

    /*
     * DESCRIPTION CHANGE
     */
    if (descriptionChanged) {
      activities.push(`Appointment details updated: "${title}".`);
    }

    const updatedAppointment = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: {
          id: appointment.id,
        },

        data: {
          title,
          description: description || null,
          startAt: newStartDate,
          endAt: newEndDate,
          status: status as AppointmentStatus,
        },
      });

      /*
       * Record EVERY appointment change against the lead.
       */
      if (appointment.leadId && activities.length > 0) {
        await tx.leadActivity.createMany({
          data: activities.map((description) => ({
            type: "APPOINTMENT" as const,
            description,
            leadId: appointment.leadId!,
            userId: current.user.id,
            organizationId: current.organization.id,
          })),
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    return NextResponse.json(
      { error: "Unable to update appointment." },
      { status: 500 },
    );
  }
}
