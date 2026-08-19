import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json();

    const { status } = body;

    const allowedStatuses = ["PENDING", "COMPLETED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid follow-up status." },
        { status: 400 },
      );
    }

    const followUp = await prisma.followUp.findFirst({
      where: {
        id,
        organizationId: current.organization.id,
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: "Follow-up not found." },
        { status: 404 },
      );
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.followUp.update({
        where: {
          id: followUp.id,
        },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });

      await transaction.leadActivity.create({
        data: {
          type: "NOTE",
          description:
            status === "COMPLETED"
              ? `Follow-up completed: ${followUp.title}`
              : status === "CANCELLED"
                ? `Follow-up cancelled: ${followUp.title}`
                : `Follow-up reopened: ${followUp.title}`,
          leadId: followUp.leadId,
          userId: current.user.id,
          organizationId: current.organization.id,
        },
      });

      return result;
    });

    return NextResponse.json({
      success: true,
      followUp: updated,
    });
  } catch (error) {
    console.error("Update follow-up error:", error);

    return NextResponse.json(
      {
        error: "Unable to update follow-up.",
      },
      { status: 500 },
    );
  }
}
