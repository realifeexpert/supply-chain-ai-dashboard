import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Loader } from "lucide-react";

export const ForecastChart = ({
  data,
  loading,
}: {
  data: any[];
  loading: boolean;
}) => (
  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
    <div className="flex items-center justify-between mb-8 relative z-10">
      <h3 className="font-bold uppercase tracking-tighter italic flex items-center gap-2 text-xl">
        <TrendingUp size={20} className="text-cyan-500" /> Predictive_Timeline
      </h3>
      <div className="hidden sm:flex gap-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        <span>
          <span className="inline-block w-3 h-1 bg-cyan-500 mr-2" /> Forecast
        </span>
        <span>
          <span className="inline-block w-3 h-3 bg-cyan-500/10 border border-cyan-500/20 mr-2" />{" "}
          Uncertainty
        </span>
      </div>
    </div>

    <div className="h-[400px] w-full relative z-10">
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <Loader className="animate-spin text-cyan-500" size={48} />
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-cyan-500/50">
            Computing_Vectors...
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="5 5"
              vertical={false}
              stroke="#88888810"
            />
            <XAxis
              dataKey="displayDate"
              fontSize={10}
              fontWeight="bold"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a" }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "20px",
                border: "1px solid #27272a",
                backgroundColor: "#09090b",
              }}
              labelClassName="font-black text-cyan-500 border-b border-white/10 pb-1 mb-2 block"
            />
            <Area
              type="monotone"
              dataKey="confidence_upper"
              stroke="none"
              fill="#06b6d4"
              fillOpacity={0.08}
            />
            <Area
              type="monotone"
              dataKey="confidence_lower"
              stroke="none"
              fill="#06b6d4"
              fillOpacity={0.08}
            />
            <Area
              type="monotone"
              dataKey="demand_estimate"
              stroke="#06b6d4"
              strokeWidth={4}
              fill="url(#colorVal)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);
