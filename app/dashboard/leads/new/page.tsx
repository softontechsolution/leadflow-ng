import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/leads/lead-form";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to leads
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Add New Lead
        </h1>

        <p className="mt-1 text-muted-foreground">
          Add a new prospect to your sales pipeline.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
