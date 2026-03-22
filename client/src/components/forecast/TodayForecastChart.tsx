import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Package, AlertTriangle } from "lucide-react";
import type { TodayProductForecast } from "@/types";

export const TodayForecastChart = ({
  data,
  loading,
}: {
  data: TodayProductForecast[];
  loading: boolean;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "#ef4444";
      case "low":
        return "#f59e0b";
      default:
        return "#10b981";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white text-sm">{data.name}</p>
          <p className="text-xs text-zinc-400">SKU: {data.sku}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-cyan-400">
              Predicted:{" "}
              <span className="font-bold">{data.predicted_demand}</span> units
            </p>
            <p className="text-xs text-zinc-300">
              Current Stock:{" "}
              <span className="font-bold">{data.current_stock}</span> units
            </p>
            <p className="text-xs text-zinc-300">
              Days of Stock:{" "}
              <span className="font-bold">{data.days_of_stock}</span>
            </p>
            <p className="text-xs text-zinc-300">
              Confidence:{" "}
              <span className="font-bold">
                {(data.confidence_score * 100).toFixed(0)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data for chart (top 10 products)
  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    displayName:
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
  }));

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold uppercase tracking-tighter italic flex items-center gap-2 text-xl">
          <Package size={20} className="text-cyan-500" />
          Today's_Product_Forecast
        </h3>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="h-[400px] w-full mb-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-cyan-500">
              Analyzing_Demand_Patterns...
            </span>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis
                dataKey="displayName"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
                fontWeight="bold"
                stroke="#71717a"
              />
              <YAxis fontSize={10} stroke="#71717a" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="predicted_demand" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getStatusColor(entry.stock_status)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Package size={48} className="text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              No_Forecast_Data_Available
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">
            Sufficient Stock
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Low Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-zinc-600 dark:text-zinc-400">
            Critical Stock
          </span>
        </div>
      </div>

      {/* Critical Items Alert */}
      {data.filter((item) => item.stock_status === "critical").length > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold uppercase">
              {data.filter((item) => item.stock_status === "critical").length}{" "}
              Products Need Immediate Attention
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
