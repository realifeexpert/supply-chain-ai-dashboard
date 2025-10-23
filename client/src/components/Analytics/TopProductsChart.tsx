import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsSummary } from "@/types"; // Path alias

interface TopProductsChartProps {
  data: AnalyticsSummary["top_selling_products"];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => (
  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={100}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: "#ffffff10" }}
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Bar
          dataKey="value"
          fill="#38bdf8"
          radius={[0, 4, 4, 0]}
          background={{ fill: "#ffffff10", radius: 4 }}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
