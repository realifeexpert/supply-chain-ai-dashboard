import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { OrderStatusBreakdownItem } from "@/types"; // Path alias

// Colors ko component ke saath move kar diya
const STATUS_COLORS: { [key: string]: string } = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Shipped: "#8b5cf6",
  "In Transit": "#a855f7",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
  Returned: "#f43f5e",
  default: "#6b7280",
};

interface OrderStatusChartProps {
  data: OrderStatusBreakdownItem[];
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const coloredData = data.map((item) => ({
    ...item,
    fill: STATUS_COLORS[item.status] || STATUS_COLORS.default,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={coloredData}
          layout="vertical"
          margin={{ left: 10, right: 30 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="status"
            stroke="#a1a1aa"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
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
            itemStyle={{ color: "#eee" }}
          />
          <Bar
            dataKey="value"
            fill="#ffffff10"
            background={{ fill: "transparent" }}
            radius={4}
            barSize={20}
            isAnimationActive={false}
          />
          <Bar dataKey="value" radius={4} barSize={20}>
            {coloredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
