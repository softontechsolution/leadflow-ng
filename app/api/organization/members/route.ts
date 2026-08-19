import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

export async function GET() {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.membership.findMany({
      where: {
        organizationId: current.organization.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error("Get organization members error:", error);

    return NextResponse.json(
      { error: "Unable to load organization members." },
      { status: 500 },
    );
  }
}
