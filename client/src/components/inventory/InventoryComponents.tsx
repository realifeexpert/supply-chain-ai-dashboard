import React from "react";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types";

// StockStatusBadge component ab apni alag file mein hai
export const StockStatusBadge: React.FC<{ status: ProductStatus }> = ({
  status,
}) => {
  const statusMap: Record<ProductStatus, string> = {
    "In Stock": "bg-green-500/10 text-green-400 border border-green-500/20",
    "Low Stock": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    "Out of Stock": "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        statusMap[status]
      )}
    >
      {status}
    </span>
  );
};
