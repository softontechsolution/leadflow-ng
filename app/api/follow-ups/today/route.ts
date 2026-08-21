import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

export async function GET() {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const followUps = await prisma.followUp.findMany({
      where: {
        organizationId: current.organization.id,

        status: "PENDING",

        scheduledAt: {
          lt: endOfToday,
        },
      },

      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            whatsapp: true,
            company: true,
            status: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        scheduledAt: "asc",
      },
    });

    const today = followUps.filter(
      (followUp) =>
        followUp.scheduledAt >= startOfToday &&
        followUp.scheduledAt <= endOfToday,
    );

    const overdue = followUps.filter(
      (followUp) => followUp.scheduledAt < startOfToday,
    );

    return NextResponse.json({
      today,
      overdue,
      counts: {
        today: today.length,
        overdue: overdue.length,
      },
    });
  } catch (error) {
    console.error("Today's follow-ups error:", error);

    return NextResponse.json(
      {
        error: "Unable to load follow-ups.",
      },
      { status: 500 },
    );
  }
}
