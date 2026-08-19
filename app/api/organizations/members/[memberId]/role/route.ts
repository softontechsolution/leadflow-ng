import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const editableRoles = ["ADMIN", "MANAGER", "AGENT", "STAFF"] as const;

type EditableRole = (typeof editableRoles)[number];

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * Only OWNER and ADMIN can manage member roles.
     */
    if (
      current.membership.role !== "OWNER" &&
      current.membership.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "You do not have permission to change member roles.",
        },
        { status: 403 },
      );
    }

    const { memberId } = await params;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const role = typeof body.role === "string" ? body.role.toUpperCase() : "";

    if (!editableRoles.includes(role as EditableRole)) {
      return NextResponse.json(
        { error: "Invalid member role." },
        { status: 400 },
      );
    }

    /*
     * Find the membership inside the current organization.
     *
     * This prevents an administrator from modifying
     * a membership belonging to another organization.
     */
    const member = await prisma.membership.findFirst({
      where: {
        id: memberId,
        organizationId: current.organization.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 },
      );
    }

    /*
     * The organization owner cannot have their role changed
     * through the normal member-role interface.
     */
    if (member.role === "OWNER") {
      return NextResponse.json(
        {
          error: "The organization owner cannot be changed here.",
        },
        { status: 400 },
      );
    }

    /*
     * Prevent an ADMIN from promoting another member to ADMIN.
     *
     * OWNERs can assign ADMIN.
     */
    if (current.membership.role === "ADMIN" && role === "ADMIN") {
      return NextResponse.json(
        {
          error: "Only the organization owner can assign the Admin role.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent an ADMIN from changing another ADMIN's role.
     *
     * This keeps ADMIN privilege management under OWNER control.
     */
    if (current.membership.role === "ADMIN" && member.role === "ADMIN") {
      return NextResponse.json(
        {
          error: "Admins cannot modify another Admin's role.",
        },
        { status: 403 },
      );
    }

    /*
     * Update the membership role.
     */
    const membership = await prisma.membership.update({
      where: {
        id: member.id,
      },
      data: {
        role: role as EditableRole,
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
      success: true,
      membership,
    });
  } catch (error) {
    console.error("Update organization member role error:", error);

    return NextResponse.json(
      {
        error: "Unable to update member role.",
      },
      { status: 500 },
    );
  }
}
