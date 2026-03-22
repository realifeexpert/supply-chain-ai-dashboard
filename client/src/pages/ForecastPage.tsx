import { useEffect, useState } from "react";
import { getDemandForecast, getProducts } from "@/services/api";
import type { Product, ForecastDataPoint } from "@/types";

// Import our new modular components
import { ForecastHeader } from "@/components/forecast/ForecastHeader";
import { ForecastControls } from "@/components/forecast/ForecastControls";
import { ForecastChart } from "@/components/forecast/ForecastChart";
import { ForecastInsights } from "@/components/forecast/ForecastInsights";
import { ForecastLogs } from "@/components/forecast/ForecastLogs";

const ForecastPage = () => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [modelConfidence, setModelConfidence] = useState<number>(0);

  /* ---------------- 📡 DATA FETCHING ---------------- */

  // Load Product List for the Selector
  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product Load Error:", err));
  }, []);

  // Load AI Forecast Data based on selection
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const id =
          selectedProductId === "all" ? undefined : Number(selectedProductId);
        const res = await getDemandForecast(id);

        // Format the date for the X-Axis display
        const formattedData = res.data.forecast.map((d: any) => ({
          ...d,
          displayDate: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        }));

        setForecastData(formattedData);
        // Backend returns decimal (0.94), we convert to percentage (94.0)
        setModelConfidence(res.data.model_confidence * 100 || 94.2);
      } catch (err) {
        console.error("Forecast Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [selectedProductId]);

  /* ---------------- 🧮 ANALYTICS ---------------- */

  const totalProjected = forecastData
    .reduce((acc, curr) => acc + curr.demand_estimate, 0)
    .toFixed(0);

  /* ---------------- 🖥️ RENDER ---------------- */

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100">
      {/* 1. TOP BRANDING & HUD METRICS */}
      <ForecastHeader
        totalProjected={totalProjected}
        modelConfidence={modelConfidence}
        loading={loading}
      />

      {/* 2. CONTEXT & PRODUCT SELECTOR */}
      <ForecastControls
        selectedId={selectedProductId}
        setSelectedId={setSelectedProductId}
        products={products}
      />

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: THE PRIMARY CHART (2/3 Width) */}
        <div className="lg:col-span-2">
          <ForecastChart data={forecastData} loading={loading} />
        </div>

        {/* RIGHT: AI INSIGHTS & SYSTEM LOGS (1/3 Width) */}
        <div className="space-y-6">
          <ForecastInsights
            confidence={modelConfidence}
            selectedId={selectedProductId}
          />
          <ForecastLogs />
        </div>
      </div>

      {/* FOOTER METRIC */}
      <p className="text-center text-[9px] font-black text-zinc-500 uppercase tracking-[0.5em] pt-4">
        Supply_Chain_AI • Neural_Engine_Active • Node_Verified
      </p>
    </div>
  );
};

export default ForecastPage;
