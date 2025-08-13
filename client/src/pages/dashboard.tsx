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
    <AppLayout title="Leads Dashboard">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-leads"
            />
            <i className="fas fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="BOUGHT">Bought</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <KPICards />
        <LeadsTable searchQuery={searchQuery} statusFilter={statusFilter} />
      </div>
    </AppLayout>
  );
}
