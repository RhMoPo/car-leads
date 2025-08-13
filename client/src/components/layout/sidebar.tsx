import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard", 
    icon: "📊",
    gradient: "from-purple-500 to-indigo-600",
    adminOnly: true,
  },
  {
    href: "/submit",
    label: "Submit Lead",
    icon: "🚗",
    gradient: "from-emerald-500 to-teal-600",
    adminOnly: false,
  },
  {
    href: "/training", 
    label: "Training",
    icon: "🎓",
    gradient: "from-amber-500 to-orange-600",
    adminOnly: false,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙️", 
    gradient: "from-slate-500 to-gray-600",
    adminOnly: true,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-72 gradient-card flex flex-col min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      <div className="absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-x-12 opacity-50"></div>
      
      <div className="relative z-10 p-8 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
            🚗
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">CarLead Pro</h1>
            <p className="text-sm text-gray-500">VA Management Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "group relative flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 cursor-pointer block",
                  isActive
                    ? "text-white shadow-lg transform scale-[1.02]"
                    : "text-gray-700 hover:bg-gray-50 hover:transform hover:scale-[1.01]"
                )}
                data-testid={`nav-${item.href.slice(1)}`}
              >
                {isActive && (
                  <span className={cn(
                    "absolute inset-0 bg-gradient-to-r rounded-2xl",
                    item.gradient
                  )}></span>
                )}
                
                <span className="relative flex items-center">
                  <span className="text-xl mr-4">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </span>
                
                {isActive && (
                  <span className="absolute right-3 w-2 h-2 bg-white rounded-full opacity-80"></span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
      
      <div className="relative z-10 p-6 border-t border-gray-100">
        <button
          onClick={() => logout()}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-200 group"
          data-testid="button-logout"
        >
          <span className="text-lg mr-4 group-hover:animate-pulse">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
