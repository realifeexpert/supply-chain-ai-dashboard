import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueDataPoint } from "@/services/api"; // Path alias

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date + "T00:00:00Z").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", timeZone: "UTC" }
    ),
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
        >
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 4, fill: "#0e7490" }}
            activeDot={{ r: 6, stroke: "#38bdf8", fill: "#0e7490" }}
          />
          <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <XAxis
            dataKey="displayDate"
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: "#ffffff30", strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#38bdf8" }}
            formatter={(value: number) => `₹${value.toLocaleString()}`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
