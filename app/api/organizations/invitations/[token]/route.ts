import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 },
      );
    }

    const invitation = await prisma.organizationInvitation.findUnique({
      where: {
        token,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 },
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "This invitation has already been accepted." },
        { status: 410 },
      );
    }

    if (invitation.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 410 },
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
        invitedBy: invitation.invitedBy,
      },
    });
  } catch (error) {
    console.error("Get organization invitation error:", error);

    return NextResponse.json(
      { error: "Unable to load invitation." },
      { status: 500 },
    );
  }
}
