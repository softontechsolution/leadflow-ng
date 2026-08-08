import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentOrganization } from "@/lib/auth/organization";

export async function POST(request: Request) {
  try {
    const current = await getCurrentOrganization();

    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const source = typeof body.source === "string" ? body.source : "OTHER";

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 },
      );
    }

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
    ];

    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: "Invalid lead source." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        company: company || null,
        notes: notes || null,
        source: source as
          | "WEBSITE"
          | "WHATSAPP"
          | "INSTAGRAM"
          | "FACEBOOK"
          | "TIKTOK"
          | "GOOGLE"
          | "REFERRAL"
          | "PHONE"
          | "WALK_IN"
          | "OTHER",
        organizationId: current.organization.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create lead error:", error);

    return NextResponse.json(
      { error: "Unable to create lead." },
      { status: 500 },
    );
  }
}
