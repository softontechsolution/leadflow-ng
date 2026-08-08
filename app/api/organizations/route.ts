import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "Business name is required." },
        { status: 400 },
      );
    }
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
    const organization = await prisma.$transaction(async (tx) => {
      const createdOrganization = await tx.organization.create({
        data: { name, slug },
      });
      await tx.membership.create({
        data: {
          userId: session.user.id,
          organizationId: createdOrganization.id,
          role: "OWNER",
        },
      });
      return createdOrganization;
    });
    return NextResponse.json({ success: true, organization }, { status: 201 });
  } catch (error) {
    console.error("Organization creation error:", error);
    return NextResponse.json(
      { error: "Unable to create organization." },
      { status: 500 },
    );
  }
}
