import React from "react";
import {
  Package,
  DollarSign,
  Calendar,
  User,
  Truck,
  Anchor,
} from "lucide-react";
import { PaymentStatusBadge } from "./OrderComponents";
import type { Order } from "@/types";
import { ModalLayout } from "@/layouts/ModalLayout";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div>
      <dt className="text-sm font-medium text-zinc-400 flex items-center gap-2">
        <Icon size={14} /> {label}
      </dt>
      <dd className="mt-1 text-sm text-white font-semibold">
        {value || <span className="text-zinc-500">N/A</span>}
      </dd>
    </div>
  );

  return (
    <ModalLayout
      isOpen={isOpen && !!order}
      onClose={onClose}
      title={`Order Details #${order?.id}`}
      size="max-w-3xl"
    >
      {/* FIXED: Added a check here. The content will only render if the 'order' object exists. */}
      {/* This prevents any attempt to read properties from a null object. */}
      {order && (
        <div className="border-t border-zinc-800 pt-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
            <DetailItem
              icon={User}
              label="Customer"
              value={
                <>
                  {order.customer_name}
                  <br />
                  <span className="text-xs font-normal text-zinc-400">
                    {order.customer_email}
                    <br />
                    {order.shipping_address}
                  </span>
                </>
              }
            />
            <DetailItem
              icon={DollarSign}
              label="Payment"
              value={
                <>
                  <PaymentStatusBadge status={order.payment_status} />
                  <br />
                  <span className="text-xs font-normal text-zinc-400">
                    {order.payment_method}
                  </span>
                </>
              }
            />
            <DetailItem
              icon={Calendar}
              label="Amount"
              value={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(order.amount)}
            />
            <DetailItem
              icon={Anchor}
              label="Shipping Provider"
              value={order.shipping_provider}
            />
            <DetailItem
              icon={Package}
              label="Tracking ID"
              value={<span className="font-mono">{order.tracking_id}</span>}
            />
            <DetailItem
              icon={Truck}
              label="Assigned Vehicle"
              value={
                order.vehicle_id ? `Vehicle #${order.vehicle_id}` : "Unassigned"
              }
            />
            <div className="md:col-span-3">
              <dt className="text-sm font-medium text-zinc-400 mb-2">
                Items in this Order ({order.items.length})
              </dt>
              <dd className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {order.items.map((item) => (
                  <div
                    key={item.product.sku}
                    className="flex justify-between items-center bg-zinc-800 p-2 rounded-md text-sm"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {item.product.name}
                      </span>{" "}
                      <span className="text-zinc-400 font-mono">
                        ({item.product.sku})
                      </span>
                    </div>
                    <span className="font-mono text-cyan-400">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </ModalLayout>
  );
};
