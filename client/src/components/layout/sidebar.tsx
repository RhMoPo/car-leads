import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    href: "/dashboard",
    label: "Leads Dashboard", 
    icon: "fas fa-chart-line",
    adminOnly: true,
  },
  {
    href: "/submit",
    label: "Submit Lead",
    icon: "fas fa-plus-circle",
    adminOnly: false,
  },
  {
    href: "/training", 
    label: "Training Videos",
    icon: "fas fa-graduation-cap",
    adminOnly: false,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "fas fa-cog", 
    adminOnly: true,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Car Lead System</h1>
        <p className="text-sm text-slate-500 mt-1">VA Management Portal</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location === item.href
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:bg-slate-100"
              )}
              data-testid={`nav-${item.href.slice(1)}`}
            >
              <i className={cn(item.icon, "w-5 h-5 mr-3")}></i>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => logout()}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          data-testid="button-logout"
        >
          <i className="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
          Logout
        </button>
      </div>
    </div>
  );
}
