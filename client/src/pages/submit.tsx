import { LeadForm } from "@/components/lead/lead-form";
import { AppLayout } from "@/components/layout/app-layout";

export default function SubmitPage() {
  return (
    <AppLayout title="Submit New Lead">
      <LeadForm />
    </AppLayout>
  );
}
