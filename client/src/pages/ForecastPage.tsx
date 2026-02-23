import React, { useEffect, useState } from "react";
import { Brain, TrendingUp, Loader, AlertTriangle } from "lucide-react";
import { getDemandForecast, getProducts } from "@/services/api";
import type { ForecastDataPoint, Product } from "@/types";

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

const ForecastPage: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [selectedProductName, setSelectedProductName] =
    useState("All Products");

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  /* ---------------- LOAD FORECAST ---------------- */
  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);

      const productId =
        selectedProductId === "all" ? undefined : Number(selectedProductId);

      try {
        const res = await getDemandForecast(productId);
        setForecastData(res.data.forecast);
      } catch (err) {
        console.error(err);
        setError("Could not load forecast data.");
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [selectedProductId]);

  /* ---------------- PRODUCT CHANGE ---------------- */
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProductId(id);

    if (id === "all") setSelectedProductName("All Products");
    else {
      const p = products.find((x) => x.id === Number(id));
      setSelectedProductName(p?.name || "Selected Product");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain size={28} className="text-purple-500 dark:text-purple-400" />
            AI Demand Forecast
          </h1>

          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Predict future product demand using historical data.
          </p>
        </div>

        {/* PRODUCT SELECT */}
        <div className="w-full sm:w-64">
          <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">
            Select Product
          </label>

          <select
            value={selectedProductId}
            onChange={handleProductChange}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="all">All Products (Total)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------------- CHART CARD ---------------- */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-cyan-600 dark:text-cyan-400" />
          30-Day Forecast: {selectedProductName}
        </h2>

        <div className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-400">
              <Loader className="animate-spin h-8 w-8" />
              <span className="ml-3">Generating forecast...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <AlertTriangle size={32} />
              <p className="mt-3 font-semibold">{error}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecastData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                {/* GRID uses CSS variable */}
                <CartesianGrid
                  stroke="var(--grid-color)"
                  strokeDasharray="3 3"
                />

                {/* AXIS uses CSS variable */}
                <XAxis
                  dataKey="date"
                  stroke="var(--axis-text)"
                  fontSize={12}
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />

                <YAxis stroke="var(--axis-text)" fontSize={12} />

                {/* TOOLTIP uses CSS variables */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg)",
                    border: "1px solid var(--tooltip-border)",
                    borderRadius: "8px",
                    color: "var(--tooltip-text)",
                    fontWeight: 700,
                  }}
                  labelStyle={{ color: "var(--tooltip-text)" }}
                />

                <Legend />

                {/* LINE uses CSS variables */}
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Forecasted Demand"
                  stroke="var(--line-color)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--line-dot)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
