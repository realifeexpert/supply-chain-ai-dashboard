import { Zap } from "lucide-react";
import type { Product } from "@/types";

interface ControlsProps {
  selectedId: string;
  setSelectedId: (id: string) => void;
  products: Product[];
}

export const ForecastControls = ({
  selectedId,
  setSelectedId,
  products,
}: ControlsProps) => (
  <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <div className="flex items-center px-4 gap-2 py-2 md:py-0">
      <Zap size={14} className="text-yellow-500 fill-yellow-500" />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Context_Selector
      </span>
    </div>

    <select
      value={selectedId}
      onChange={(e) => setSelectedId(e.target.value)}
      className="w-full md:w-auto bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-none p-3 rounded-xl text-xs font-bold outline-none ring-1 ring-zinc-200 dark:ring-white/10 focus:ring-cyan-500 transition-all cursor-pointer min-w-[280px] shadow-sm"
    >
      <option value="all">GLOBAL_STOCKS_AGGREGATE</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name.toUpperCase()} — {p.sku}
        </option>
      ))}
    </select>
  </div>
);
