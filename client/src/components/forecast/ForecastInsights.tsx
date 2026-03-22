import { Info, Brain } from "lucide-react";

export const ForecastInsights = ({
  confidence,
  selectedId,
}: {
  confidence: number;
  selectedId: string;
}) => (
  <div className="bg-cyan-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
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
        Stock replenishment focus:
        <span className="bg-white/20 px-2 py-0.5 rounded ml-1 italic">
          {selectedId === "all" ? "Aggregated Fleet" : "Specific SKU"}
        </span>
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black border-b border-white/20 pb-1">
          <span>CONFIDENCE_SCORE</span>
          <span>{confidence.toFixed(1)}%</span>
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
);
