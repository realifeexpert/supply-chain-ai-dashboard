import {
  TrendingUp,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type {
  ForecastAccuracy,
  SeasonalDecomposition,
  HistoricalSummary,
} from "@/types";

export const ForecastMetrics = ({
  accuracy,
  decomposition,
  historical,
  confidence,
}: {
  accuracy?: ForecastAccuracy;
  decomposition?: SeasonalDecomposition | null;
  historical?: HistoricalSummary;
  confidence: number;
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-500";
    if (conf >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return <CheckCircle size={16} className="text-green-500" />;
    if (conf >= 60)
      return <AlertCircle size={16} className="text-yellow-500" />;
    return <AlertCircle size={16} className="text-red-500" />;
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-cyan-500" size={18} />
        <h4 className="font-black uppercase tracking-tighter text-xs text-zinc-500">
          MODEL_PERFORMANCE_METRICS
        </h4>
      </div>

      <div className="space-y-4">
        {/* Model Confidence */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {getConfidenceIcon(confidence)}
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                Model Confidence
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Forecast Reliability Score
              </p>
            </div>
          </div>
          <div
            className={`text-lg font-black ${getConfidenceColor(confidence)}`}
          >
            {confidence.toFixed(0)}%
          </div>
        </div>

        {/* Accuracy Metrics */}
        {accuracy && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                MAE
              </p>
              <p className="text-sm font-black text-cyan-500">
                {accuracy.mae.toFixed(1)}
              </p>
              <p className="text-[9px] text-zinc-500 uppercase">
                Mean Abs Error
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                RMSE
              </p>
              <p className="text-sm font-black text-cyan-500">
                {accuracy.rmse.toFixed(1)}
              </p>
              <p className="text-[9px] text-zinc-500 uppercase">
                Root Mean Sq Error
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                MAPE
              </p>
              <p className="text-sm font-black text-cyan-500">
                {accuracy.mape.toFixed(1)}%
              </p>
              <p className="text-[9px] text-zinc-500 uppercase">
                Mean Abs % Error
              </p>
            </div>
          </div>
        )}

        {/* Historical Summary */}
        {historical && (
          <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-cyan-500" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                Historical Performance
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500 uppercase tracking-widest">
                  Data Points
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {historical.total_days} days
                </p>
              </div>
              <div>
                <p className="text-zinc-500 uppercase tracking-widest">
                  Avg Daily
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {historical.avg_daily_demand.toFixed(1)} units
                </p>
              </div>
              <div>
                <p className="text-zinc-500 uppercase tracking-widest">
                  Peak Demand
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {historical.max_daily_demand} units
                </p>
              </div>
              <div>
                <p className="text-zinc-500 uppercase tracking-widest">
                  Total Demand
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {historical.total_demand} units
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seasonal Insights */}
        {decomposition && (
          <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-cyan-500" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                Seasonal Pattern Detected
              </p>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Weekly seasonality identified in demand patterns
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
