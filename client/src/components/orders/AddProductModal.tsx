import React, { useState } from "react";
import type { Product, ProductCreate } from "@/types";
import { createProduct } from "@/services/api";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: Product) => void;
  // Parent component se state setter function pass kar rahe hain
  setSelectedProductId: (id: string) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  setSelectedProductId,
}) => {
  const [newProductSku, setNewProductSku] = useState("");
  const [newProductStatus, setNewProductStatus] = useState<
    "In Stock" | "Low Stock" | "Out of Stock"
  >("In Stock");
  const [productLoading, setProductLoading] = useState(false);

  const handleCreateProduct = async () => {
    // Logic ko bilkul same rakha gaya hai
    const nameInput = document.querySelector(
      'input[name="product"]'
    ) as HTMLInputElement;
    const typedProductName = nameInput ? nameInput.value : "";

    if (!typedProductName || !newProductSku) {
      alert("Product Name and SKU are required.");
      return;
    }
    setProductLoading(true);

    const payload: ProductCreate = {
      name: typedProductName,
      sku: newProductSku,
      stock_quantity: 0,
      status: newProductStatus,
    };

    try {
      const response = await createProduct(payload);
      const newProduct = response.data;
      onProductAdded(newProduct); // OrdersPage ki state update karein
      setSelectedProductId(String(newProduct.id)); // Naye product ko auto-select karein
      onClose(); // Modal band karein
      alert(`Product "${newProduct.name}" created successfully!`);
    } catch (err: any) {
      alert(
        "Failed to create product: " +
          (err.response?.data?.detail || "Unknown error")
      );
    } finally {
      setProductLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4">
      <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-sm border border-zinc-600">
        <h3 className="text-lg font-bold mb-4">Create New Product</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400">Product Name</label>
            <input
              type="text"
              disabled
              value={
                (
                  document.querySelector(
                    'input[name="product"]'
                  ) as HTMLInputElement
                )?.value || ""
              }
              className="w-full bg-zinc-700 border-zinc-600 rounded-lg px-3 py-2 mt-1 disabled:opacity-70"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Product SKU *</label>
            <input
              type="text"
              placeholder="e.g., PROD-001"
              value={newProductSku}
              onChange={(e) => setNewProductSku(e.target.value.toUpperCase())}
              className="w-full bg-zinc-700 border-zinc-600 rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Initial Status</label>
            <select
              value={newProductStatus}
              onChange={(e) => setNewProductStatus(e.target.value as any)}
              className="w-full bg-zinc-700 border-zinc-600 rounded-lg px-3 py-2 mt-1"
            >
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={productLoading}
            className="bg-zinc-600 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProduct}
            disabled={productLoading}
            className="bg-cyan-600 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {productLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
