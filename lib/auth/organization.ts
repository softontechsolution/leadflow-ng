import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentOrganization() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    return null;
  }

  return {
    user: session.user,
    organization: membership.organization,
    membership,
  };
}
