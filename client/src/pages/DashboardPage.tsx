import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Package, Timer, Truck } from "lucide-react";
import type { DashboardSummary } from "@/types";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  change,
}) => (
  <div className="bg-zinc-900 rounded-lg shadow-lg p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
      <Icon className="h-5 w-5 text-zinc-500" />
    </div>
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{change}</p>
    </div>
  </div>
);

const chartData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
];

const DashboardPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getDashboardSummary();
        setSummaryData(response.data);
      } catch (error) {
        console.error("Failed to fetch summary data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatRevenue = (value: number) => {
    return `$${(value / 1000).toFixed(1)}k`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* UPDATE: Loading state ke liye placeholder cards dikhayeinge */}
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-lg shadow-lg p-5 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2 mt-2"></div>
              </div>
            ))}
        </div>
      ) : summaryData ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* UPDATE: Humne Optional Chaining (?.) aur Nullish Coalescing (??) ka istemal kiya hai */}
          {/* Isse agar data undefined ho, to app crash nahi hoga aur default value '0' dikhegi. */}
          <KPICard
            title="Total Revenue"
            value={formatRevenue(summaryData?.total_revenue ?? 0)}
            icon={DollarSign}
            change="+2.5% from last month"
          />
          <KPICard
            title="Total Orders"
            value={summaryData?.total_orders?.toString() ?? "0"}
            icon={Package}
            change="+5.1% from last month"
          />
          <KPICard
            title="On-Time Deliveries"
            value={`${summaryData?.on_time_deliveries ?? 0}%`}
            icon={Timer}
            change="+1.2% from last month"
          />
          <KPICard
            title="Pending Orders"
            value={summaryData?.pending_orders?.toString() ?? "0"}
            icon={Truck}
            change="-0.5% from last week"
          />
        </div>
      ) : (
        <p className="text-red-400">Could not load dashboard data.</p>
      )}

      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Monthly Revenue
        </h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "#ffffff10" }}
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Bar dataKey="revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
