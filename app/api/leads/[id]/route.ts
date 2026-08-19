import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

const validSources = [
  "WEBSITE",
  "WHATSAPP",
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "GOOGLE",
  "REFERRAL",
  "PHONE",
  "WALK_IN",
  "OTHER",
] as const;

type LeadSource = (typeof validSources)[number];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId: current.organization.id,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const body = await request.json();

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";

    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";

    const email = typeof body.email === "string" ? body.email.trim() : "";

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    const whatsapp =
      typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";

    const company = typeof body.company === "string" ? body.company.trim() : "";

    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    const source =
      typeof body.source === "string" ? body.source : existingLead.source;

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 },
      );
    }

    if (!validSources.includes(source as LeadSource)) {
      return NextResponse.json(
        { error: "Invalid lead source." },
        { status: 400 },
      );
    }

    const updatedLead = await prisma.$transaction(async (transaction) => {
      const lead = await transaction.lead.update({
        where: {
          id: existingLead.id,
        },
        data: {
          firstName,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
          whatsapp: whatsapp || null,
          company: company || null,
          notes: notes || null,
          source: source as LeadSource,
        },
      });

      await transaction.leadActivity.create({
        data: {
          type: "NOTE",
          description: "Lead information updated.",
          leadId: lead.id,
          userId: current.user.id,
          organizationId: current.organization.id,
        },
      });

      return lead;
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return NextResponse.json(
      {
        error: "Unable to update lead.",
      },
      { status: 500 },
    );
  }
}
