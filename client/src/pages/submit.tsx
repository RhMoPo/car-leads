import { LeadForm } from "@/components/lead/lead-form";
import { AppLayout } from "@/components/layout/app-layout";

export default function SubmitPage() {
  return (
    <AppLayout title="Submit Lead">
      <div className="space-y-8">
        {/* Header */}
        <div className="gradient-card p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Submit a New Car Lead 🚗
            </h1>
            <p className="text-gray-600">
              Fill out the details below to submit a potential car deal. Our system will automatically calculate estimated profit and commission.
            </p>
          </div>
        </div>

        <LeadForm />
      </div>
    </AppLayout>
  );
}
