import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const validRoles = ["ADMIN", "MANAGER", "AGENT", "STAFF"] as const;

type InvitationRole = (typeof validRoles)[number];

export async function POST(request: Request) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * Only OWNER and ADMIN can invite team members.
     */
    if (
      current.membership.role !== "OWNER" &&
      current.membership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You do not have permission to invite members." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const role = typeof body.role === "string" ? body.role : "STAFF";

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (!validRoles.includes(role as InvitationRole)) {
      return NextResponse.json(
        { error: "Invalid invitation role." },
        { status: 400 },
      );
    }

    /*
     * Prevent inviting someone who is already a member.
     */
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          where: {
            organizationId: current.organization.id,
          },
        },
      },
    });

    if (existingUser?.memberships.length) {
      return NextResponse.json(
        { error: "This user is already a member of your organization." },
        { status: 409 },
      );
    }

    /*
     * Prevent multiple active invitations for the same email.
     */
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: current.organization.id,
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          error: "An active invitation already exists for this email address.",
        },
        { status: 409 },
      );
    }

    /*
     * Invitations expire after 7 days.
     */
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token = randomBytes(32).toString("hex");

    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        role: role as InvitationRole,
        token,
        expiresAt,
        organizationId: current.organization.id,
        invitedById: current.user.id,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    const invitationUrl = `${baseUrl}/invite/${invitation.token}`;

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          invitationUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create organization invitation error:", error);

    return NextResponse.json(
      {
        error: "Unable to create invitation.",
      },
      { status: 500 },
    );
  }
}
