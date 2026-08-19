import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const validRoles = ["OWNER", "ADMIN", "MANAGER", "AGENT", "STAFF"] as const;

type UserRole = (typeof validRoles)[number];

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
     * Only OWNER and ADMIN can change team member roles.
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

    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: "Invalid member role." },
        { status: 400 },
      );
    }

    /*
     * Find the membership inside the current organization.
     *
     * This prevents users from modifying memberships belonging
     * to another organization.
     */
    const membership = await prisma.membership.findFirst({
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

    if (!membership) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 },
      );
    }

    /*
     * The OWNER cannot be modified by an ADMIN.
     *
     * Only the OWNER can manage the OWNER membership.
     */
    if (membership.role === "OWNER" && current.membership.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Only the organization owner can modify the owner.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent changing the OWNER to another role through
     * the normal member-management endpoint.
     *
     * Ownership transfer should be a separate, deliberate
     * operation later.
     */
    if (membership.role === "OWNER" && role !== "OWNER") {
      return NextResponse.json(
        {
          error: "The owner role cannot be changed from team management.",
        },
        { status: 403 },
      );
    }

    /*
     * ADMINs cannot promote another member to OWNER.
     */
    if (current.membership.role === "ADMIN" && role === "OWNER") {
      return NextResponse.json(
        {
          error: "Only the organization owner can assign the owner role.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent unnecessary database writes.
     */
    if (membership.role === role) {
      return NextResponse.json({
        success: true,
        message: "Member role is already set to this role.",
        membership,
      });
    }

    /*
     * Update the membership.
     */
    const updatedMembership = await prisma.membership.update({
      where: {
        id: membership.id,
      },
      data: {
        role: role as UserRole,
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
      message: "Member role updated successfully.",
      membership: updatedMembership,
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
