import React from "react";
// Path alias ka use karke types import kiye
import type { AnalyticsSummary } from "@/types";

interface KpiCardGridProps {
  kpi_cards: AnalyticsSummary["kpi_cards"];
}

export const KpiCardGrid: React.FC<KpiCardGridProps> = ({ kpi_cards }) => {
  return (
    <>
      {kpi_cards.slice(0, 6).map((card, index) => (
        <div
          key={index}
          className="bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-800"
        >
          <h3 className="text-sm font-medium text-zinc-400 mb-1 truncate">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          {card.change && (
            <p
              className={`text-xs ${
                card.change.startsWith("+")
                  ? "text-green-400"
                  : card.change.startsWith("-")
                  ? "text-red-400"
                  : "text-zinc-400"
              }`}
            >
              {card.change}
            </p>
          )}
        </div>
      ))}
    </>
  );
};
