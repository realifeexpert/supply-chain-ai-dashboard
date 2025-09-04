import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Package,
  Truck,
  Users,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    // Yahaan hum 'isActive' ke liye type add kar rahe hain
    className={({ isActive }: { isActive: boolean }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-white hover:bg-zinc-700/50",
        isActive && "bg-zinc-700 text-white"
      )
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

const navItems: NavItemProps[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/logistics", label: "Logistics", icon: Truck },
  { to: "/users", label: "Users", icon: Users },
];

const DashboardLayout: React.FC = () => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-zinc-950 text-white">
      <div className="hidden border-r border-zinc-800 bg-zinc-900/50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-zinc-800 px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/" className="flex items-center gap-2 font-semibold">
              <Truck className="h-6 w-6 text-cyan-400" />
              <span className="">SupplyChain AI</span>
            </NavLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-900/50 px-4 lg:h-[60px] lg:px-6">
          {/* Header content can go here */}
          <div className="w-full flex-1"></div>
          <Bell className="h-5 w-5 text-zinc-400" />
          <Settings className="h-5 w-5 text-zinc-400" />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-zinc-950 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
