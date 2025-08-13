import { useQuery } from "@tanstack/react-query";
import type { KPIData } from "@/lib/types";

export function KPICards() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    {
      label: "New This Week",
      value: kpis.newThisWeek,
      icon: "fas fa-plus",
      color: "blue",
      change: "+12%",
      changeLabel: "from last week",
    },
    {
      label: "Approved",
      value: kpis.approved,
      icon: "fas fa-check",
      color: "green", 
      change: "75%",
      changeLabel: "approval rate",
    },
    {
      label: "Avg Est. Profit",
      value: `£${kpis.avgEstimatedProfit}`,
      icon: "fas fa-pound-sign",
      color: "amber",
      change: "+8%",
      changeLabel: "from last month",
    },
    {
      label: "Sold This Month",
      value: kpis.sold,
      icon: "fas fa-car",
      color: "emerald",
      change: "+15%",
      changeLabel: "conversion rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          data-testid={`kpi-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${card.color}-100 rounded-lg flex items-center justify-center`}>
              <i className={`${card.icon} text-${card.color}-600`}></i>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600 font-medium">{card.change}</span>
            <span className="text-sm text-slate-500 ml-1">{card.changeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
