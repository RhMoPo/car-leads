import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusModal } from "./status-modal";
import { cn } from "@/lib/utils";
import type { LeadWithVA } from "@shared/schema";

interface LeadsTableProps {
  searchQuery?: string;
  statusFilter?: string;
}

export function LeadsTable({ searchQuery, statusFilter }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: leads, isLoading } = useQuery<LeadWithVA[]>({
    queryKey: ["/api/leads", { search: searchQuery, status: statusFilter }],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, any];
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.status) searchParams.set("status", params.status);
      return fetch(`/api/leads?${searchParams}`).then(res => res.json());
    },
  });

  const handleStatusChange = (leadId: string, status: string) => {
    setSelectedLead(leadId);
    setSelectedStatus(status);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800";
      case "APPROVED": return "bg-yellow-100 text-yellow-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "CONTACTED": return "bg-blue-100 text-blue-800";
      case "BOUGHT": return "bg-purple-100 text-purple-800";
      case "SOLD": return "bg-green-100 text-green-800";
      case "PAID": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProfitColor = (profit: number) => {
    if (profit >= 800) return "text-green-600";
    if (profit >= 400) return "text-amber-600";
    return "text-red-600";
  };

  const getRowBackground = (profit: number) => {
    if (profit >= 800) return "bg-green-50";
    if (profit >= 400) return "bg-amber-50";
    return "bg-red-50";
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "PENDING":
        return [
          { label: "Approve", action: "APPROVED", color: "green" },
          { label: "Reject", action: "REJECTED", color: "red" },
        ];
      case "APPROVED":
        return [
          { label: "Contact", action: "CONTACTED", color: "blue" },
          { label: "Reject", action: "REJECTED", color: "red" },
        ];
      case "CONTACTED":
        return [
          { label: "Bought", action: "BOUGHT", color: "purple" },
          { label: "Reject", action: "REJECTED", color: "red" },
        ];
      case "BOUGHT":
        return [
          { label: "Mark Sold", action: "SOLD", color: "green" },
        ];
      case "SOLD":
        return [
          { label: "Mark Paid", action: "PAID", color: "emerald" },
        ];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Leads</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Leads</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-slate-500">No leads found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recent Leads</h3>
          <p className="text-sm text-slate-500 mt-1">Manage and track all submitted car leads</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">VA Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Asking Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Est. Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={cn(
                    "hover:bg-slate-50",
                    getRowBackground(lead.estimatedProfit)
                  )}
                  data-testid={`row-lead-${lead.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {lead.va.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {lead.year} {lead.make} {lead.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    £{lead.askingPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={getProfitColor(lead.estimatedProfit)}>
                      £{lead.estimatedProfit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    £{lead.estimatedCommission.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {getAvailableActions(lead.status).map((action) => (
                        <Button
                          key={action.action}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(lead.id, action.action)}
                          className={cn(
                            "text-xs px-2 py-1",
                            action.color === "green" && "text-green-600 hover:text-green-800 bg-green-50",
                            action.color === "red" && "text-red-600 hover:text-red-800 bg-red-50",
                            action.color === "blue" && "text-blue-600 hover:text-blue-800 bg-blue-50",
                            action.color === "purple" && "text-purple-600 hover:text-purple-800 bg-purple-50",
                            action.color === "emerald" && "text-emerald-600 hover:text-emerald-800 bg-emerald-50"
                          )}
                          data-testid={`button-${action.action.toLowerCase()}-${lead.id}`}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        leadId={selectedLead}
        status={selectedStatus}
      />
    </>
  );
}
