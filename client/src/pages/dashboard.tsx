import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { LeadsTable } from "@/components/lead/leads-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="gradient-card p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Your Dashboard 🚗
            </h1>
            <p className="text-gray-600">
              Track your car leads and monitor performance in real-time
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="gradient-card p-6 rounded-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search leads by make, model, or VA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modern-input pl-12"
                data-testid="input-search-leads"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 modern-input" data-testid="select-status-filter">
                <SelectValue placeholder="All Status 📊" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2">
                <SelectItem value="">All Status 📊</SelectItem>
                <SelectItem value="PENDING">🕐 Pending</SelectItem>
                <SelectItem value="APPROVED">✅ Approved</SelectItem>
                <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                <SelectItem value="CONTACTED">📞 Contacted</SelectItem>
                <SelectItem value="BOUGHT">🛒 Bought</SelectItem>
                <SelectItem value="SOLD">💰 Sold</SelectItem>
                <SelectItem value="PAID">💸 Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <KPICards />
        <LeadsTable searchQuery={searchQuery} statusFilter={statusFilter} />
      </div>
    </AppLayout>
  );
}
