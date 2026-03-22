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
import { Brain, BarChart3 } from "lucide-react";

export const ModelComparisonChart = ({
  data,
  loading,
}: {
  data: any[];
  loading: boolean;
}) => {
  // Prepare data for model comparison
  const comparisonData = data.map((item) => ({
    date: item.displayDate,
    ensemble: item.demand_estimate,
    linear: item.linear_forecast || item.demand_estimate,
    arima: item.arima_forecast || item.demand_estimate,
    upper: item.confidence_upper,
    lower: item.confidence_lower,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white text-sm mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p
              key={entry.dataKey}
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}:{" "}
              <span className="font-bold">{entry.value?.toFixed(1)}</span>
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
          <Brain size={20} className="text-cyan-500" />
          Model_Comparison_Analysis
        </h3>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">
          Ensemble vs Individual Models
        </div>
      </div>

      <div className="h-[400px] w-full mb-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <span className="text-sm font-bold uppercase tracking-widest text-cyan-500">
              Comparing_Model_Performance...
            </span>
          </div>
        ) : comparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis
                dataKey="date"
                fontSize={10}
                fontWeight="bold"
                stroke="#71717a"
              />
              <YAxis fontSize={10} stroke="#71717a" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }} />
              <Line
                type="monotone"
                dataKey="ensemble"
                stroke="#06b6d4"
                strokeWidth={3}
                name="Ensemble Forecast"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="linear"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Linear Regression"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="arima"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="10 5"
                name="ARIMA Model"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="upper"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Confidence Upper"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lower"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="2 2"
                name="Confidence Lower"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <BarChart3 size={48} className="text-zinc-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              No_Comparison_Data_Available
            </span>
          </div>
        )}
      </div>

      {/* Model Performance Summary */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-center">
          <p className="font-bold text-cyan-600 dark:text-cyan-400 uppercase">
            Ensemble
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Best Overall Performance
          </p>
        </div>
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          <p className="font-bold text-green-600 dark:text-green-400 uppercase">
            Linear
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">Fast & Reliable</p>
        </div>
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="font-bold text-yellow-600 dark:text-yellow-400 uppercase">
            ARIMA
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Advanced Time Series
          </p>
        </div>
      </div>
    </div>
  );
};
