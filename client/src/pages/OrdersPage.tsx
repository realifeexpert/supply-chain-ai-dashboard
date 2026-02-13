import React, { useEffect, useState } from "react";
import { getOrders, getProducts, deleteOrder } from "@/services/api";
import { Search, PlusCircle } from "lucide-react";
import type { Order, Product } from "@/types";
import { useRealTimeSync } from "@/hooks/useRealTimeSync";

import { AddOrderModal } from "@/components/orders/AddOrderModal";
import { EditOrderModal } from "@/components/orders/EditOrderModal";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { ConfirmationModal } from "@/components/orders/ConfirmationModal";
import { OrderTable } from "@/components/orders/OrderTable";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useRealTimeSync(fetchOrders);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          getOrders(),
          getProducts(),
        ]);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // SAFE SEARCH (no crash)
  const filteredOrders = orders.filter((o) => {
    const name = (o.customer_name || "").toLowerCase();
    const email = (o.customer_email || "").toLowerCase();
    const id = o.id?.toString() || "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) || email.includes(search) || id.includes(search)
    );
  });

  const handleOrderAdded = (newOrder: Order) =>
    setOrders([newOrder, ...orders]);

  const handleOrderUpdated = (updatedOrder: Order) =>
    setOrders(orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));

  const handleViewClick = (order: Order) => setViewingOrder(order);

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(orders.filter((o) => o.id !== orderToDelete.id));
      setIsConfirmModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <>
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOrderAdded={handleOrderAdded}
        products={products}
        onProductAdded={handleProductAdded}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={editingOrder}
        onOrderUpdated={handleOrderUpdated}
      />

      <OrderDetailsModal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Delete Order #${orderToDelete?.id}?`}
        loading={isDeleting}
      />

      <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Order Management</h1>
            <p className="text-sm text-zinc-400">
              Track and manage customer orders.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            <PlusCircle size={18} />
            Add Order
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search order id, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <OrderTable
          loading={loading}
          error={error}
          orders={filteredOrders}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>
    </>
  );
};

export default OrdersPage;
