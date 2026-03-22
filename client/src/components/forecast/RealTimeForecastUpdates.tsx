import { useState } from "react";
import { RefreshCw, Clock, Zap } from "lucide-react";

export const RealTimeForecastUpdates = ({
  onRefresh,
  lastUpdate,
}: {
  onRefresh: () => void;
  lastUpdate: Date | null;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="text-cyan-500" size={18} />
        <h4 className="font-black uppercase tracking-tighter text-xs text-zinc-500">
          Real_Time_Updates
        </h4>
      </div>

      <div className="space-y-4">
        {/* Last Update Info */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-zinc-500" />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                Last Updated
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {getTimeSinceUpdate()}
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            {lastUpdate?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 text-white rounded-xl border border-cyan-500 transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <RefreshCw
            size={16}
            className={`transition-transform duration-300 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-widest">
            {isRefreshing ? "Updating..." : "Refresh_Forecasts"}
          </span>
        </button>

        {/* Auto Update Indicator */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest">
              Auto_Update_Enabled
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            Forecasts refresh every 15 minutes with new sales data
          </p>
        </div>

        {/* Update Triggers */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Update_Triggers:
          </p>
          <div className="space-y-1 text-[9px] text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
              <span>New order placed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
              <span>Inventory level changes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
              <span>Scheduled 15-minute intervals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
