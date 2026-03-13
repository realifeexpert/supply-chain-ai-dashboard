import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Package,
  Truck,
  Users,
  Settings,
  Bell,
  PanelLeft,
  Menu,
  X,
  FileUp,
  Brain,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { supabase } from "@/lib/supabase"; // Import supabase for logout

/* ---------------- THEME HOOK ---------------- */

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = saved || (systemDark ? "dark" : "light");

    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return { theme, toggleTheme };
};

/* ---------------- NAV ITEM ---------------- */

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isExpanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  isExpanded,
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 dark:text-zinc-400 transition hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
        isActive &&
          "bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-white font-medium",
        !isExpanded && "justify-center",
      )
    }
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap",
        isExpanded ? "w-full" : "w-0",
      )}
    >
      {label}
    </span>
  </NavLink>
);

/* ---------------- NAV ITEMS ---------------- */

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/forecast", label: "AI Forecast", icon: Brain },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/logistics", label: "Logistics", icon: Truck },
  { to: "/import", label: "Import / Export", icon: FileUp },
  { to: "/users", label: "Users", icon: Users },
  // Added Admin Management to the Sidebar
  { to: "/admin-management", label: "Admin Control", icon: ShieldCheck },
];

/* ---------------- MAIN LAYOUT ---------------- */

const DashboardLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSettingsSave = () => {
    setIsSettingsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/login");
    } else {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSettingsSave={handleSettingsSave}
      />

      <div
        className={cn(
          "grid min-h-screen w-full bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white transition",
          isSidebarExpanded
            ? "md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]"
            : "md:grid-cols-[70px_1fr]",
        )}
      >
        {/* DESKTOP SIDEBAR */}
        <div className="hidden border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:block">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-4">
              <NavLink to="/" className="flex items-center gap-2 font-semibold">
                <Truck className="h-6 w-6 text-blue-600" />
                {isSidebarExpanded && (
                  <span className="text-gray-900 dark:text-white uppercase tracking-tighter font-black">
                    SupplyChain AI
                  </span>
                )}
              </NavLink>

              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 text-sm font-medium space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  isExpanded={isSidebarExpanded}
                />
              ))}
            </nav>

            {/* LOGOUT BUTTON IN SIDEBAR */}
            <div className="p-2 border-t border-gray-200 dark:border-zinc-800">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/10 font-bold",
                  !isSidebarExpanded && "justify-center",
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4">
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            {/* THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            <button className="p-2 relative rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800">
              <Bell className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
            </button>
          </header>

          <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-zinc-950 overflow-auto">
            <Outlet context={{ refreshKey }} />
          </main>
        </div>

        {/* MOBILE SIDEBAR */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden",
            isMobileSidebarOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
          )}
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-transform duration-300",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-4">
                <span className="font-black uppercase tracking-tighter italic text-blue-600">
                  SupplyChain AI
                </span>
                <button onClick={() => setIsMobileSidebarOpen(false)}>
                  <X className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
                </button>
              </div>

              <nav className="flex-1 p-2 text-sm font-medium space-y-1">
                {navItems.map((item) => (
                  <NavItem key={item.to} {...item} isExpanded />
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-red-500 font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
