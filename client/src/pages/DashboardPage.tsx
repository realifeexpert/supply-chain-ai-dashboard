import React, { useEffect, useState } from "react";
// --- CHANGE 1: Import new function and type ---
import {
  getDashboardSummary,
  getMonthlyRevenue,
  type MonthlyRevenueDataPoint,
} from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid, // Added CartesianGrid
} from "recharts";
import {
  IndianRupee,
  Package,
  Timer,
  Truck,
  AlertTriangle,
} from "lucide-react"; // Added AlertTriangle
import type { AnalyticsSummary, KpiCard } from "@/types";

// (Assuming USD_TO_INR_RATE is no longer needed as backend provides INR)
// const USD_TO_INR_RATE = 83.5;

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  change,
}) => (
  <div className="bg-zinc-900 rounded-lg shadow-lg p-5 flex flex-col justify-between border border-zinc-800">
    {" "}
    {/* Added border */}
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-zinc-400 truncate">{title}</h3>{" "}
      {/* Added truncate */}
      <Icon className="h-5 w-5 text-zinc-500 flex-shrink-0" />{" "}
      {/* Added flex-shrink-0 */}
    </div>
    <div>
      <p className="text-3xl font-bold text-white truncate">{value}</p>{" "}
      {/* Added truncate */}
      {change && (
        <p
          className={`text-xs mt-1 ${
            change.startsWith("+")
              ? "text-green-400"
              : change.startsWith("-")
              ? "text-red-400"
              : "text-zinc-400"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  </div>
);

// Map titles from backend directly (adjust keys if backend titles change)
const iconMap: { [key: string]: React.ElementType } = {
  "Total Orders": Package,
  Revenue: IndianRupee,
  "On-Time Deliveries": Timer, // Placeholder
  "Pending Orders": Truck,
  "Low Stock Items": AlertTriangle, // Assign an icon
  "Inventory Value": IndianRupee, // Assign an icon
};

const DashboardPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<AnalyticsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // --- CHANGE 2: Add state for Monthly Revenue Chart ---
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<
    MonthlyRevenueDataPoint[]
  >([]);
  const [monthlyRevenueLoading, setMonthlyRevenueLoading] = useState(true);
  const [monthlyRevenueError, setMonthlyRevenueError] = useState<string | null>(
    null
  );

  // Fetch Summary KPIs
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const response = await getDashboardSummary();
        setSummaryData(response.data);
      } catch (error) {
        console.error("Failed to fetch summary data:", error);
        setSummaryError("Could not load dashboard summary.");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // --- CHANGE 3: Fetch Monthly Revenue Data ---
  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      setMonthlyRevenueLoading(true);
      setMonthlyRevenueError(null);
      try {
        // Fetch last 6 months by default
        const response = await getMonthlyRevenue(6);
        setMonthlyRevenueData(response.data.data); // Access nested 'data'
      } catch (error) {
        console.error("Failed to fetch monthly revenue data:", error);
        setMonthlyRevenueError("Could not load monthly revenue chart.");
      } finally {
        setMonthlyRevenueLoading(false);
      }
    };
    fetchMonthlyRevenue();
  }, []); // Runs once on mount

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

      {/* KPI Cards Section */}
      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {/* Simple Skeleton Loaders for KPIs */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-lg p-5 h-[108px] animate-pulse border border-zinc-800"
            >
              <div className="h-4 bg-zinc-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : summaryError ? (
        <p className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">
          {summaryError}
        </p>
      ) : summaryData?.kpi_cards ? (
        // --- CHANGE 4: Use xl:grid-cols-6 for potentially 6 cards ---
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {summaryData.kpi_cards.map((card: KpiCard) => (
            <KPICard
              key={card.title}
              title={card.title}
              value={card.value} // Value is already formatted in backend
              change={card.change}
              icon={iconMap[card.title] || IndianRupee} // Fallback icon
            />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No summary data available.</p>
      )}

      {/* Monthly Revenue Chart Section */}
      <div className="bg-zinc-900 rounded-lg shadow-lg p-6 border border-zinc-800">
        {" "}
        {/* Added border */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Monthly Revenue (Last 6 Months)
        </h2>
        <div style={{ width: "100%", height: 300 }}>
          {/* --- CHANGE 5: Add Loading/Error states and use real data --- */}
          {monthlyRevenueLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Loading chart...
            </div>
          ) : monthlyRevenueError ? (
            <div className="h-full flex items-center justify-center text-red-400">
              {monthlyRevenueError}
            </div>
          ) : monthlyRevenueData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid
                  stroke="#3f3f46"
                  strokeDasharray="3 3"
                  vertical={false}
                />{" "}
                {/* Nicer grid */}
                <XAxis
                  dataKey="month" // Use month name from backend
                  stroke="#a1a1aa" // Updated color
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#a1a1aa" // Updated color
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  // --- CHANGE 6: Better formatter for various values ---
                  tickFormatter={(value) => {
                    if (value >= 10000000)
                      return `₹${(value / 10000000).toFixed(1)}Cr`; // Crores
                    if (value >= 100000)
                      return `₹${(value / 100000).toFixed(1)}L`; // Lakhs
                    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`; // Thousands
                    return `₹${value}`; // Below 1k
                  }}
                  width={70} // Adjusted width
                />
                <Tooltip
                  cursor={{ fill: "#ffffff10" }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#22d3ee" }} // Match bar color
                  formatter={(value: number) => `₹${value.toLocaleString()}`} // Format tooltip precisely
                />
                <Bar
                  dataKey="revenue" // Use revenue from backend
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                  barSize={30} // Optional: Adjust bar size
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              No revenue data for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
