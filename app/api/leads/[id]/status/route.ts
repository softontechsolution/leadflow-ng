import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const validStatuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "WON",
  "LOST",
] as const;

type LeadStatus = (typeof validStatuses)[number];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();

    const status = body.status as string;

    if (!validStatuses.includes(status as LeadStatus)) {
      return NextResponse.json(
        { error: "Invalid lead status." },
        { status: 400 },
      );
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: current.organization.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (existingLead.status === status) {
      return NextResponse.json({
        success: true,
        lead: existingLead,
      });
    }

    const updatedLead = await prisma.$transaction(async (transaction) => {
      const lead = await transaction.lead.update({
        where: {
          id: existingLead.id,
        },
        data: {
          status: status as LeadStatus,
        },
      });

      await transaction.leadActivity.create({
        data: {
          type: "STATUS_CHANGE",
          description: `Status changed from ${existingLead.status.replace(
            "_",
            " ",
          )} to ${status.replace("_", " ")}`,
          leadId: lead.id,
          userId: current.user.id,
          organizationId: current.organization.id,
        },
      });

      return lead;
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead status error:", error);

    return NextResponse.json(
      {
        error: "Unable to update lead status.",
      },
      { status: 500 },
    );
  }
}
