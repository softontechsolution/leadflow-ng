import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

export async function POST(request: Request) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { leadId, title, notes, scheduledAt } = body;

    if (!leadId || !title || !scheduledAt) {
      return NextResponse.json(
        {
          error: "Lead, title and scheduled date are required.",
        },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: current.organization.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const followUp = await prisma.$transaction(async (transaction) => {
      const created = await transaction.followUp.create({
        data: {
          title,
          notes: notes || null,
          scheduledAt: new Date(scheduledAt),
          leadId,
          userId: current.user.id,
          organizationId: current.organization.id,
        },
      });

      await transaction.leadActivity.create({
        data: {
          type: "NOTE",
          description: `Follow-up scheduled: ${title}`,
          leadId,
          userId: current.user.id,
          organizationId: current.organization.id,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        followUp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create follow-up error:", error);

    return NextResponse.json(
      {
        error: "Unable to create follow-up.",
      },
      { status: 500 },
    );
  }
}
