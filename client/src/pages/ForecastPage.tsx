import { useEffect, useState } from "react";
import { getDemandForecast, getProducts } from "@/services/api";
import type {
  Product,
  ForecastDataPoint,
  TopMover,
  TodayProductForecast,
} from "@/types";

import { ForecastHeader } from "@/components/forecast/ForecastHeader";
import { ForecastControls } from "@/components/forecast/ForecastControls";
import { ForecastChart } from "@/components/forecast/ForecastChart";
import { ForecastInsights } from "@/components/forecast/ForecastInsights";
import { ForecastLogs } from "@/components/forecast/ForecastLogs";
import { ForecastMoverCard } from "@/components/forecast/ForecastMoverCard";
import { TodayForecastChart } from "@/components/forecast/TodayForecastChart";
import { ForecastMetrics } from "@/components/forecast/ForecastMetrics";
import { ModelComparisonChart } from "@/components/forecast/ModelComparisonChart";
import { SeasonalDecompositionChart } from "@/components/forecast/SeasonalDecompositionChart";
import { RealTimeForecastUpdates } from "@/components/forecast/RealTimeForecastUpdates";
import { ForecastExport } from "@/components/forecast/ForecastExport";

const ForecastPage = () => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [todayForecasts, setTodayForecasts] = useState<TodayProductForecast[]>(
    [],
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [moversLoading, setMoversLoading] = useState<boolean>(true);
  const [todayLoading, setTodayLoading] = useState<boolean>(true);
  const [modelConfidence, setModelConfidence] = useState<number>(0);
  const [accuracyMetrics, setAccuracyMetrics] = useState<any>(null);
  const [seasonalDecomp, setSeasonalDecomp] = useState<any>(null);
  const [historicalSummary, setHistoricalSummary] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(console.error);

    setMoversLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/forecast/top-movers-tomorrow`)
      .then((res) => res.json())
      .then((data) => setTopMovers(data))
      .catch(() => setTopMovers([]))
      .finally(() => setMoversLoading(false));

    setTodayLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/forecast/today-forecast`)
      .then((res) => res.json())
      .then((data) => setTodayForecasts(data))
      .catch(() => setTodayForecasts([]))
      .finally(() => setTodayLoading(false));
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const id =
        selectedProductId === "all" ? undefined : Number(selectedProductId);
      const res = await getDemandForecast(id);

      const formattedData = res.data.forecast.map((d: any) => ({
        ...d,
        displayDate: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));

      setForecastData(formattedData);
      setModelConfidence((res.data as any).model_confidence || 94.2);
      setAccuracyMetrics((res.data as any).accuracy_metrics);
      setSeasonalDecomp((res.data as any).seasonal_decomposition);
      setHistoricalSummary((res.data as any).historical_summary);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Inference Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedProductId]);

  const totalProjected = forecastData
    .reduce(
      (acc: number, curr: ForecastDataPoint) =>
        acc + (curr.demand_estimate || 0),
      0,
    )
    .toFixed(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* SECTION 1 */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <ForecastHeader
            totalProjected={totalProjected}
            modelConfidence={modelConfidence}
            loading={loading}
          />
        </div>

        {/* SECTION 2 */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
          <ForecastControls
            selectedId={selectedProductId}
            setSelectedId={setSelectedProductId}
            products={products}
          />
        </div>

        {/* SECTION 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border p-6 overflow-hidden">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white">
              Today's Inference Map
            </h2>
            <TodayForecastChart data={todayForecasts} loading={todayLoading} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border p-6">
            <ForecastMoverCard movers={topMovers} loading={moversLoading} />
          </div>
        </div>

        {/* SECTION 4 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border">
            <h3 className="text-sm font-black uppercase text-zinc-500 mb-4 tracking-widest">
              Model Vector Comparison
            </h3>
            <ModelComparisonChart data={forecastData} loading={loading} />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border">
            <h3 className="text-sm font-black uppercase text-zinc-500 mb-4 tracking-widest">
              Seasonal Decomposition
            </h3>
            <SeasonalDecompositionChart
              decomposition={seasonalDecomp}
              loading={loading}
            />
          </div>
        </div>

        {/* SECTION 5 */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border">
          <ForecastChart data={forecastData} loading={loading} />

          <div className="mt-8 flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  modelConfidence > 90 ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Engine Confidence: {modelConfidence}%
              </span>
            </div>

            <div className="w-1/3 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-1000"
                style={{ width: `${modelConfidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-8 border min-w-0">
            <h3 className="text-lg font-black uppercase mb-6 tracking-tighter italic">
              Engine Advanced Metrics
            </h3>
            <ForecastMetrics
              accuracy={accuracyMetrics}
              decomposition={seasonalDecomp}
              historical={historicalSummary}
              confidence={modelConfidence}
            />
          </div>

          <div className="flex flex-col gap-6 min-w-0">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 overflow-hidden">
              <RealTimeForecastUpdates
                onRefresh={fetchForecast}
                lastUpdate={lastUpdate}
              />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 overflow-hidden">
              <ForecastExport
                forecastData={forecastData}
                todayForecasts={todayForecasts}
                accuracy={accuracyMetrics}
                historical={historicalSummary}
              />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 overflow-hidden">
              <ForecastInsights
                confidence={modelConfidence}
                selectedId={selectedProductId}
              />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-6 overflow-hidden">
              <ForecastLogs />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
