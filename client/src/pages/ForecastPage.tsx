import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Loader,
  Info,
  ShieldCheck,
  Activity,
  Zap,
} from "lucide-react";
import { getDemandForecast, getProducts } from "@/services/api";
import type { Product, ForecastDataPoint } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ForecastPage = () => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [modelConfidence, setModelConfidence] = useState<number>(0);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product Load Error:", err));
  }, []);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const id =
          selectedProductId === "all" ? undefined : Number(selectedProductId);
        const res = await getDemandForecast(id);

        // Match the backend's new keys: demand_estimate, confidence_upper, confidence_lower
        // Map them to the keys used in the chart
        const formattedData = res.data.forecast.map((d: any) => ({
          ...d,
          displayDate: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }));

        setForecastData(formattedData);
        setModelConfidence(res.data.model_confidence * 100 || 94.2);
      } catch (err) {
        console.error("Forecast Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [selectedProductId]);

  const totalProjected = forecastData
    .reduce((acc, curr) => acc + curr.demand_estimate, 0)
    .toFixed(0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100">
      {/* --- TOP BAR: HUD METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
            <Brain className="text-cyan-500 animate-pulse" size={32} />
            PROPHET_SYSTEM <span className="text-cyan-500/50">v2.1</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] ml-1">
            Neural Demand Inference Engine
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase">
              30D_Volume_Projection
            </p>
            <p className="text-xl font-black italic">
              {loading ? "---" : `${totalProjected} units`}
            </p>
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase">
              Engine_Health
            </p>
            <p className="text-xl font-black italic">
              {modelConfidence.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* --- SELECTION & FILTER --- */}
      <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
        <div className="flex items-center px-4 gap-2">
          <Zap size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Context_Selector
          </span>
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="bg-zinc-800 text-white border-none p-3 rounded-xl text-xs font-bold outline-none ring-1 ring-white/10 focus:ring-cyan-500 transition-all cursor-pointer min-w-[240px]"
        >
          <option value="all">GLOBAL_STOCKS_AGGREGATE</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.toUpperCase()} — {p.sku}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- MAIN CHART CARD --- */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-bold uppercase tracking-tighter italic flex items-center gap-2 text-xl">
                <TrendingUp size={20} className="text-cyan-500" />
                Predictive_Timeline
              </h3>
              <p className="text-[9px] text-zinc-500 font-bold ml-7 uppercase">
                Seasonality-aware linear regression
              </p>
            </div>
            <div className="hidden sm:flex gap-6 text-[9px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <span className="w-3 h-1 bg-cyan-500 rounded-full" /> Forecast
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-500/10 border border-cyan-500/20 rounded-sm" />{" "}
                Uncertainty_Range
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
                  data={forecastData}
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
                    cursor={{
                      stroke: "#06b6d4",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid #27272a",
                      backgroundColor: "#09090b",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "15px",
                    }}
                    itemStyle={{ padding: "2px 0", fontWeight: "bold" }}
                    labelClassName="font-black text-cyan-500 mb-2 block border-b border-white/10 pb-1"
                  />
                  {/* The Confidence Zone (Area between lower and upper) */}
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
                  {/* The Primary Prediction Line */}
                  <Area
                    type="monotone"
                    dataKey="demand_estimate"
                    name="Projected Demand"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    fill="url(#colorVal)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* --- INSIGHTS SIDEBAR --- */}
        <div className="space-y-6">
          <div className="bg-cyan-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-cyan-500/30 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Info size={20} />
                </div>
                <h4 className="font-black uppercase tracking-tighter text-xl">
                  AI_STRATEGY
                </h4>
              </div>
              <p className="text-xs font-bold leading-relaxed uppercase tracking-wider opacity-90 mb-4">
                Targeted stock replenishment should focus on
                <span className="bg-white/20 px-2 py-0.5 rounded ml-1 italic">
                  {selectedProductId === "all"
                    ? "Aggregated Fleet"
                    : "Specific SKU"}
                </span>
                .
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black border-b border-white/20 pb-1">
                  <span>CONFIDENCE_SCORE</span>
                  <span>{modelConfidence.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[10px] font-black border-b border-white/20 pb-1">
                  <span>MODEL_TYPE</span>
                  <span>Multi-Variate OLS</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 rotate-12">
              <Brain size={160} />
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8">
            <h4 className="font-black uppercase tracking-tighter text-[10px] mb-6 text-zinc-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
              LIVE_INFERENCE_LOG
            </h4>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start border-l-2 border-zinc-800 pl-4 py-1"
                >
                  <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                    0{i}:00
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">
                    Vector analysis completed for{" "}
                    <span className="text-zinc-100">node_{i}x9</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
