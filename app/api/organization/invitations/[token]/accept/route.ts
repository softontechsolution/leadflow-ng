import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in to accept this invitation.",
          requiresLogin: true,
        },
        { status: 401 },
      );
    }

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

    /*
     * The invitation belongs to a specific email address.
     * The logged-in account must match it.
     */
    if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: "This invitation was sent to a different email address.",
        },
        { status: 403 },
      );
    }

    const result = await prisma.$transaction(async (transaction) => {
      const existingMembership = await transaction.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: invitation.organizationId,
          },
        },
      });

      if (existingMembership) {
        await transaction.organizationInvitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            acceptedAt: new Date(),
          },
        });

        return existingMembership;
      }

      const membership = await transaction.membership.create({
        data: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      await transaction.organizationInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          acceptedAt: new Date(),
        },
      });

      return membership;
    });

    return NextResponse.json({
      success: true,
      membership: result,
      organizationId: invitation.organizationId,
    });
  } catch (error) {
    console.error("Accept organization invitation error:", error);

    return NextResponse.json(
      {
        error: "Unable to accept invitation.",
      },
      { status: 500 },
    );
  }
}
