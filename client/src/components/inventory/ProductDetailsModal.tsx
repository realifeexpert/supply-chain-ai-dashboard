import React from "react";
import dayjs from "dayjs";
import {
  X,
  Package,
  Tag,
  Building,
  Hash,
  BarChart,
  DollarSign,
  Bell,
  Calendar,
} from "lucide-react";
import type { Product } from "@/types";
import { StockStatusBadge } from "./InventoryComponents";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// Helper component for displaying detail items
const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div>
    <dt className="text-xs font-medium text-zinc-400 flex items-center gap-2">
      <Icon size={14} className="text-zinc-500" />
      {label}
    </dt>
    <dd className="mt-1.5 text-sm font-semibold text-white">
      {value || <span className="text-zinc-500">N/A</span>}
    </dd>
  </div>
);

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD MMM YYYY, h:mm A");
  };

  const stockValue = (product.cost_price || 0) * product.stock_quantity;

  return (
    // --- UI CHANGE: Made the modal wrapper scrollable ---
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start overflow-y-auto p-4 pt-8 md:pt-12">
      {/* --- UI CHANGE: Increased padding, max-width, and bottom margin --- */}
      <div className="bg-zinc-900 rounded-lg shadow-xl p-8 w-full max-w-3xl relative border border-zinc-700 mb-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"
        >
          <X size={20} />
        </button>

        {/* --- UI CHANGE: Increased gap between carousel and details --- */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          {product.images && product.images.length > 0 && (
            <div className="w-full md:w-1/3">
              <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}
                className="rounded-lg overflow-hidden border border-zinc-800"
              >
                {product.images.map((media) => (
                  <div key={media.id} className="aspect-square bg-black">
                    {media.media_type === "image" ? (
                      <img
                        src={media.media_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        src={media.media_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          <div
            className={
              product.images && product.images.length > 0
                ? "w-full md:w-2/3"
                : "w-full"
            }
          >
            {/* --- UI CHANGE: Increased font size for product name and spacing below SKU --- */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {product.name}
            </h2>
            <p className="text-sm font-mono text-zinc-400 mb-6">
              SKU: {product.sku}
            </p>

            {/* --- UI CHANGE: Grouped details in a visually distinct container --- */}
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 bg-zinc-800/50 p-4 rounded-lg">
              <DetailItem
                icon={Package}
                label="Stock Quantity"
                value={`${product.stock_quantity} units`}
              />
              <DetailItem
                icon={BarChart}
                label="Status"
                value={<StockStatusBadge status={product.status} />}
              />
              <DetailItem
                icon={Tag}
                label="Category"
                value={product.category}
              />
              <DetailItem
                icon={DollarSign}
                label="Cost Price"
                value={formatCurrency(product.cost_price)}
              />
              <DetailItem
                icon={DollarSign}
                label="Selling Price"
                value={formatCurrency(product.selling_price)}
              />
              <DetailItem
                icon={Hash}
                label="Stock Value (Cost)"
                value={formatCurrency(stockValue)}
              />
              <DetailItem
                icon={Bell}
                label="Reorder Level"
                value={`${product.reorder_level || "N/A"} units`}
              />
              <DetailItem
                icon={Building}
                label="Supplier"
                value={product.supplier}
              />
              <DetailItem
                icon={Calendar}
                label="Last Restocked"
                value={formatDate(product.last_restocked)}
              />
            </dl>
          </div>
        </div>

        {product.description && (
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">
              AI Generated Description
            </h3>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
