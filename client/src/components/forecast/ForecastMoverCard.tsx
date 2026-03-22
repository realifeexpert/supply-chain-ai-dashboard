import {
  Flame,
  ArrowUpRight,
  AlertCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";
import type { TopMover } from "@/types";

export const ForecastMoverCard = ({
  movers,
  loading,
}: {
  movers: TopMover[];
  loading: boolean;
}) => (
  <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-2 mb-6">
      <Flame className="text-orange-500 fill-orange-500" size={18} />
      <h4 className="font-black uppercase tracking-tighter text-[10px] text-zinc-500">
        DEMAND_ANOMALY_DETECTION
      </h4>
    </div>

    {/* Content */}
    <div className="space-y-4 relative z-10">
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"
            />
          ))}
        </div>
      ) : movers.length > 0 ? (
        movers.map((product) => (
          <div
            key={product.id}
            className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase">
                  {product.sku}
                </p>
                <h5 className="font-bold text-xs truncate w-28 uppercase">
                  {product.name}
                </h5>
              </div>

              <div className="text-right">
                <div className="flex items-center text-orange-500 font-black italic gap-1 text-sm">
                  <ArrowUpRight size={12} />
                  {product.predicted_qty}u
                </div>
              </div>
            </div>

            {product.current_stock < product.predicted_qty && (
              <div className="mt-2 flex items-center gap-1.5 text-[8px] font-black text-red-500 uppercase bg-red-500/5 p-1.5 rounded-lg border border-red-500/10">
                <AlertCircle size={10} />
                CRITICAL_STOCK_DEFICIT
              </div>
            )}
          </div>
        ))
      ) : (
        /* Professional Empty State */
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Status: Stable_Demand
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1 leading-relaxed">
              No significant spikes predicted <br />
              for the next 24-hour cycle.
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
      <Activity size={200} />
    </div>
  </div>
);
