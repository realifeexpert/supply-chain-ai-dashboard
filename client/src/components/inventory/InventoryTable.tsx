import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react"; // Eye icon import karein
import type { Product } from "@/types";
import { StockStatusBadge } from "./InventoryComponents";

// Props ke interface mein 'onView' function add karein
interface InventoryTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void; // Naya prop
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView, // Naye prop ko receive karein
}) => {
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-zinc-800/50">
          <tr>
            {/* --- Columns kam kar diye gaye hain --- */}
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
              Stock Value (Cost)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-zinc-900 divide-y divide-zinc-800">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-zinc-800/50">
              {/* --- Sirf zaroori details yahan dikhayi jaa rahi hain --- */}
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                {product.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-zinc-400">
                {product.sku}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-300">
                {product.stock_quantity} units
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">
                {formatCurrency(
                  (product.cost_price || 0) * product.stock_quantity
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <StockStatusBadge status={product.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-4">
                  {/* --- NAYA "VIEW" BUTTON EYE ICON KE SAATH --- */}
                  <button
                    onClick={() => onView(product)}
                    className="text-zinc-400 hover:text-white"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="text-cyan-400 hover:text-cyan-300"
                    title="Edit Product"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="text-red-500 hover:text-red-400"
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
