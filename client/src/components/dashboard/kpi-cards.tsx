import { useQuery } from "@tanstack/react-query";
import type { KPIData } from "@/lib/types";
import { TrendingUp, CheckCircle, DollarSign, Car } from "lucide-react";

export function KPICards() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="gradient-card p-6 rounded-2xl animate-pulse">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-xl w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded-xl w-16"></div>
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
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
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      change: "+12%",
      changeLabel: "from last week",
      changePositive: true,
    },
    {
      label: "Approved",
      value: kpis.approved,
      icon: CheckCircle,
      gradient: "from-blue-500 to-indigo-600", 
      bgColor: "from-blue-50 to-indigo-50",
      change: "75%",
      changeLabel: "approval rate",
      changePositive: true,
    },
    {
      label: "Avg Est. Profit",
      value: `£${kpis.avgEstimatedProfit}`,
      icon: DollarSign,
      gradient: "from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-orange-50",
      change: "+8%",
      changeLabel: "from last month",
      changePositive: true,
    },
    {
      label: "Sold This Month",
      value: kpis.sold,
      icon: Car,
      gradient: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      change: "+15%",
      changeLabel: "conversion rate",
      changePositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="gradient-card p-6 rounded-2xl card-hover relative overflow-hidden"
          data-testid={`kpi-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.bgColor} rounded-full -translate-y-10 translate-x-10 opacity-30`}></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium ${
                card.changePositive 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                <span className="mr-1">{card.changePositive ? "📈" : "📉"}</span>
                {card.change}
              </div>
              <span className="text-sm text-gray-500 ml-2">{card.changeLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
