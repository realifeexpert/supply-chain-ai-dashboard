import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "@/index.css";

/* ---------------- THEME CONTROLLER ---------------- */

const ThemeController = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle("dark", systemDark);
    }
  }, []);

  return <>{children}</>;
};

/* ---------------- ROUTES ---------------- */

import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import OrdersPage from "@/pages/OrdersPage";
import InventoryPage from "@/pages/InventoryPage";
import LogisticsPage from "@/pages/LogisticsPage";
import UsersPage from "@/pages/UsersPage";
import ImportPage from "@/pages/ImportPage";
import ForecastPage from "@/pages/ForecastPage";
import AuthPage from "@/pages/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "forecast", element: <ForecastPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "logistics", element: <LogisticsPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
  { path: "/auth", element: <AuthPage /> },
]);

/* ---------------- APP MOUNT ---------------- */

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeController>
      <RouterProvider router={router} />
    </ThemeController>
  </React.StrictMode>,
);
