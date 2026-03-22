import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Waves, TrendingUp, Activity } from "lucide-react";

export const SeasonalDecompositionChart = ({
  decomposition,
  loading,
}: {
  decomposition: any;
  loading: boolean;
}) => {
  // Prepare data for seasonal decomposition
  const chartData = decomposition
    ? decomposition.trend.map((trend: number, index: number) => ({
        day: `Day ${index + 1}`,
        trend: trend,
        seasonal: decomposition.seasonal[index],
        residual: decomposition.residual[index],
      }))
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}:{" "}
              <span className="font-bold">{entry.value?.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold uppercase tracking-tighter italic flex items-center gap-2 text-xl">
          <Waves size={20} className="text-cyan-500" />
          Seasonal_Decomposition
        </h3>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">
          Trend + Seasonal + Residual
        </div>
      </div>

      <div className="h-[300px] w-full mb-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-cyan-500">
              Analyzing_Seasonal_Patterns...
            </span>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis
                dataKey="day"
                fontSize={10}
                fontWeight="bold"
                stroke="#71717a"
              />
              <YAxis fontSize={10} stroke="#71717a" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }} />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#06b6d4"
                strokeWidth={3}
                name="Trend"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="seasonal"
                stroke="#10b981"
                strokeWidth={2}
                name="Seasonal"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="residual"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Residual"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Activity size={48} className="text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Insufficient_Data_For_Seasonal_Analysis
            </span>
            <p className="text-xs text-zinc-400 text-center max-w-xs">
              Need at least 14 days of historical data to perform seasonal
              decomposition
            </p>
          </div>
        )}
      </div>

      {/* Decomposition Explanation */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-center">
            <TrendingUp
              size={16}
              className="mx-auto mb-1 text-cyan-600 dark:text-cyan-400"
            />
            <p className="font-bold text-cyan-600 dark:text-cyan-400 uppercase">
              Trend
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Long-term direction
            </p>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <Waves
              size={16}
              className="mx-auto mb-1 text-green-600 dark:text-green-400"
            />
            <p className="font-bold text-green-600 dark:text-green-400 uppercase">
              Seasonal
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">Weekly patterns</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <Activity
              size={16}
              className="mx-auto mb-1 text-red-600 dark:text-red-400"
            />
            <p className="font-bold text-red-600 dark:text-red-400 uppercase">
              Residual
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">Random variation</p>
          </div>
        </div>
      )}
    </div>
  );
};
