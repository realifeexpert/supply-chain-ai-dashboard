import React, { useEffect, useState } from "react";
// --- CHANGE 1: 'useOutletContext' ko import karein ---
import { useOutletContext } from "react-router-dom";
// --- Assuming correct path ---
import { getProducts, deleteProduct } from "@/services/api";
import { PlusCircle, Search } from "lucide-react";
import type { Product } from "@/types";

// --- Assuming correct paths ---
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { EditItemModal } from "@/components/inventory/EditItemModal";
import { ConfirmationModal } from "@/components/inventory/ConfirmationModal";
import { ProductDetailsModal } from "@/components/inventory/ProductDetailsModal";

// --- CHANGE 2: Context ka type define karein ---
type OutletContextType = {
  refreshKey: number;
};

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // --- CHANGE 3: Layout se 'refreshKey' ko prapt karein ---
  const { refreshKey } = useOutletContext<OutletContextType>();

  // --- CHANGE 4: useEffect ko 'refreshKey' par depend karein ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Refresh hone par loading state set karein
      try {
        console.log("Fetching products due to refresh key change:", refreshKey); // Optional: Debug log
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Optionally, set an error state to show in the UI
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [refreshKey]); // Jab bhi refreshKey badlega, yeh function dobara chalega

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase())) // Also search category
  );

  // --- Handlers ---

  const handleProductAdded = (newProduct: Product) => {
    // Add to the beginning and re-sort or fetch again for consistency
    setProducts((prevProducts) =>
      [newProduct, ...prevProducts].sort((a, b) => a.name.localeCompare(b.name))
    );
    setIsAddModalOpen(false); // Close modal on success
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(
      (prevProducts) =>
        prevProducts
          .map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
          .sort((a, b) => a.name.localeCompare(b.name)) // Keep sorted
    );
    setIsEditModalOpen(false); // Close modal on success
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };

  const handleViewClick = (product: Product) => {
    setViewingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete.id)
      );
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Replace alert with a more user-friendly notification if possible
      alert("Could not delete the product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
      {editingProduct && ( // Conditionally render Edit modal only when product exists
        <EditItemModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }} // Clear editingProduct on close
          onProductUpdated={handleProductUpdated}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Item Deletion"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" (SKU: ${productToDelete?.sku})? This action cannot be undone.`}
        loading={isDeleting}
      />
      {viewingProduct && ( // Conditionally render Details modal
        <ProductDetailsModal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          product={viewingProduct}
        />
      )}

      <div className="bg-zinc-900 rounded-lg shadow-lg p-4 sm:p-6 border border-zinc-800">
        {" "}
        {/* Added border */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Inventory Management
            </h1>
            <p className="text-sm text-zinc-400">
              Track and manage product stock levels.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <PlusCircle size={18} />
            <span>Add New Item</span>
          </button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />{" "}
            {/* Added pointer-events-none */}
            <input
              type="search" // Use type="search" for better semantics and clear button
              placeholder="Search by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" // Added focus styles
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-zinc-400 flex justify-center items-center gap-3">
            {/* Simple Loader */}
            <svg
              className="animate-spin h-6 w-6 text-cyan-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-800/50 rounded-lg">
            {searchTerm
              ? `No products found matching "${searchTerm}".`
              : "No products found. Add a new item to get started."}
          </div>
        ) : (
          <InventoryTable
            products={filteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
          />
        )}
      </div>
    </>
  );
};

export default InventoryPage;
