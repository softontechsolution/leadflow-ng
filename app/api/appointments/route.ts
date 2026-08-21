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

export async function POST(request: Request) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const startAt = typeof body.startAt === "string" ? body.startAt : "";

    const endAt = typeof body.endAt === "string" ? body.endAt : "";

    const leadId =
      typeof body.leadId === "string" && body.leadId.trim()
        ? body.leadId.trim()
        : null;

    const customerId =
      typeof body.customerId === "string" && body.customerId.trim()
        ? body.customerId.trim()
        : null;

    const status = typeof body.status === "string" ? body.status : "SCHEDULED";

    if (!title) {
      return NextResponse.json(
        { error: "Appointment title is required." },
        { status: 400 },
      );
    }

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: "Start and end times are required." },
        { status: 400 },
      );
    }

    if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
      return NextResponse.json(
        { error: "Invalid appointment status." },
        { status: 400 },
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid appointment date or time." },
        { status: 400 },
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End time must be after start time." },
        { status: 400 },
      );
    }

    /*
     * Verify the lead belongs to the current organization.
     */
    if (leadId) {
      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          organizationId: current.organization.id,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!lead) {
        return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      }
    }

    /*
     * Verify the customer belongs to the current organization.
     */
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          organizationId: current.organization.id,
        },
        select: {
          id: true,
        },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found." },
          { status: 404 },
        );
      }
    }

    /*
     * Create appointment + activity atomically.
     */
    const appointment = await prisma.$transaction(async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          title,
          description: description || null,
          startAt: startDate,
          endAt: endDate,
          status: status as
            | "SCHEDULED"
            | "CONFIRMED"
            | "COMPLETED"
            | "CANCELLED"
            | "NO_SHOW",
          organizationId: current.organization.id,
          leadId,
          customerId,
        },
      });

      /*
       * Record appointment activity against the lead.
       *
       * Appointments attached only to a customer do not create
       * LeadActivity because LeadActivity requires a leadId.
       */
      if (leadId) {
        await tx.leadActivity.create({
          data: {
            type: "APPOINTMENT",
            description: `Appointment scheduled: "${title}" for ${new Intl.DateTimeFormat(
              "en-NG",
              {
                dateStyle: "medium",
                timeStyle: "short",
              },
            ).format(startDate)}.`,
            leadId,
            userId: current.user.id,
            organizationId: current.organization.id,
          },
        });
      }

      return createdAppointment;
    });

    return NextResponse.json(
      {
        success: true,
        appointment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create appointment error:", error);

    return NextResponse.json(
      { error: "Unable to create appointment." },
      { status: 500 },
    );
  }
}
