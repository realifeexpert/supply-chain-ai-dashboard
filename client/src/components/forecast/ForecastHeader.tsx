import { Brain, Activity, ShieldCheck } from "lucide-react";

interface HeaderProps {
  totalProjected: string;
  modelConfidence: number;
  loading: boolean;
}

export const ForecastHeader = ({
  totalProjected,
  modelConfidence,
  loading,
}: HeaderProps) => (
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
);
