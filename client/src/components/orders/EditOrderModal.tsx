import React, { useEffect, useState, type FormEvent } from "react";
// REMOVED: The 'X' icon is no longer needed here as it's handled by the layout.
import type { Order, OrderUpdate } from "@/types";
import { updateOrder } from "@/services/api";
// ADDED: Importing the new reusable ModalLayout component.
import { ModalLayout } from "@/layouts/ModalLayout";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (updatedOrder: Order) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}) => {
  const [formData, setFormData] = useState<OrderUpdate>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        payment_status: order.payment_status,
        shipping_provider: order.shipping_provider,
        tracking_id: order.tracking_id,
        vehicle_id: order.vehicle_id,
      });
    }
  }, [order]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        vehicle_id: Number(formData.vehicle_id) || undefined,
      };
      const response = await updateOrder(order.id, payload);
      onOrderUpdated(response.data);
      onClose();
    } catch (err: any) {
      // --- CATCH BLOCK KO IS NAYI LOGIC SE UPDATE KAREIN ---
      if (
        err.response?.data?.detail &&
        Array.isArray(err.response.data.detail)
      ) {
        // Agar Pydantic ka detailed error hai
        const firstError = err.response.data.detail[0];
        const field = firstError.loc[1] || "input";
        const msg = firstError.msg;
        setError(`Error in '${field}': ${msg}`);
      } else if (err.response?.data?.detail) {
        // Agar backend se simple text error hai
        setError(err.response.data.detail);
      } else {
        // Fallback error
        setError("Failed to update order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: The check for 'isOpen' and 'order' is now handled by ModalLayout.
  // if (!isOpen || !order) return null;

  // CHANGED: The entire JSX is now wrapped in the ModalLayout component.
  // The layout handles the backdrop, close button, and click-outside-to-close logic.
  return (
    <ModalLayout
      isOpen={isOpen && !!order} // The modal should only be open if there is an order to edit.
      onClose={onClose}
      title={`Edit Order #${order?.id}`} // The title is passed as a prop.
      size="max-w-md" // The size is passed as a prop.
    >
      {/* The form is now passed as 'children' to the ModalLayout. */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Order Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Payment Status
          </label>
          <select
            name="payment_status"
            value={formData.payment_status}
            onChange={handleChange}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2"
          >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="COD">COD</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Shipping Provider
          </label>
          <select
            name="shipping_provider"
            value={formData.shipping_provider}
            onChange={handleChange}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2"
          >
            <option value="">None</option>
            <option value="Self-Delivery">Self-Delivery</option>
            <option value="BlueDart">BlueDart</option>
            <option value="Delhivery">Delhivery</option>
            <option value="DTDC">DTDC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Tracking ID
          </label>
          <input
            name="tracking_id"
            value={formData.tracking_id || ""}
            onChange={handleChange}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Assigned Vehicle ID
          </label>
          <input
            name="vehicle_id"
            type="number"
            value={formData.vehicle_id || ""}
            onChange={handleChange}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-700 hover:bg-zinc-600 font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
};
