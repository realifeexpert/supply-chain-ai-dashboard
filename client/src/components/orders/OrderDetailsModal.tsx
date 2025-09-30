import React from "react";
import {
  Package,
  IndianRupee,
  User,
  Truck,
  Anchor,
  Clock,
  Tag,
  Receipt,
} from "lucide-react";
import { PaymentStatusBadge } from "./OrderComponents";
import type { Order } from "@/types";
import { ModalLayout } from "@/layouts/ModalLayout";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

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
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-medium text-zinc-400 flex items-center gap-2">
        <Icon size={14} /> {label}
      </dt>
      <dd className="text-base text-white font-semibold">
        {value || <span className="text-zinc-500 italic">N/A</span>}
      </dd>
    </div>
  );

  return (
    <ModalLayout
      isOpen={isOpen && !!order}
      onClose={onClose}
      title={`Order Details #${order?.id}`}
      size="max-w-4xl"
    >
      {order && (
        <div className="flex flex-col gap-6 -mt-2">
          {/* --- Main Details Section (Unchanged) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <DetailItem
              icon={User}
              label="Customer"
              value={
                <div className="flex flex-col text-sm leading-6">
                  <span className="font-bold text-white">
                    {order.customer_name}
                  </span>
                  <span className="text-zinc-300">{order.customer_email}</span>
                  <span className="text-zinc-400 mt-1">
                    {order.shipping_address}
                  </span>
                </div>
              }
            />
            <DetailItem
              icon={IndianRupee}
              label="Payment"
              value={
                <div className="flex flex-col gap-2 text-sm">
                  <PaymentStatusBadge status={order.payment_status} />
                  <span className="text-zinc-300">{order.payment_method}</span>
                </div>
              }
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
            <div className="flex flex-col gap-1 md:col-span-2 border-t border-zinc-800 pt-6">
              <dt className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Receipt size={14} /> Financial Summary
              </dt>
              <dd className="text-base text-white font-semibold">
                <dl className="space-y-2 text-sm mt-2 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <dt className="text-zinc-400">Subtotal</dt>
                    <dd className="font-mono">
                      {formatCurrency(order.subtotal)}
                    </dd>
                  </div>
                  {(order.discount_value || 0) > 0 && (
                    <div className="flex justify-between items-center text-red-400">
                      <dt className="flex items-center gap-2">
                        <Tag size={14} />
                        Discount
                        <span className="text-xs text-red-500">
                          (
                          {order.discount_type === "percentage"
                            ? `${order.discount_value || 0}%`
                            : "Fixed"}
                          )
                        </span>
                      </dt>
                      <dd className="font-mono">
                        -
                        {formatCurrency(
                          order.discount_type === "percentage"
                            ? (order.subtotal * (order.discount_value || 0)) /
                                100
                            : order.discount_value || 0
                        )}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <dt className="text-zinc-400">Total GST</dt>
                    <dd className="font-mono">
                      +{formatCurrency(order.total_gst)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-zinc-400">Shipping</dt>
                    <dd className="font-mono">
                      +{formatCurrency(order.shipping_charges || 0)}
                    </dd>
                  </div>
                  <div className="border-t border-zinc-700 my-2"></div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <dt>Total Amount</dt>
                    <dd className="font-mono text-cyan-400">
                      {formatCurrency(order.total_amount)}
                    </dd>
                  </div>
                </dl>
              </dd>
            </div>
          </div>

          {/* --- UPDATED "Items in this Order" SECTION (FINAL PROFESSIONAL UI) --- */}
          <div className="border-t border-zinc-800 pt-4 flex flex-col gap-2">
            <dt className="text-sm font-medium text-zinc-400">
              Items in this Order ({order.items.length})
            </dt>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-left"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Qty
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Taxable
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      GST
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 font-semibold text-right"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    // Per-item calculations (LOGIC IS UNCHANGED)
                    const rate = item.product.selling_price || 0;
                    const amount = rate * item.quantity;
                    let itemDiscount = 0;
                    if ((order.discount_value || 0) > 0 && order.subtotal > 0) {
                      const totalDiscount =
                        order.discount_type === "percentage"
                          ? (order.subtotal * (order.discount_value || 0)) / 100
                          : order.discount_value || 0;
                      const itemShare = amount / order.subtotal;
                      itemDiscount = itemShare * totalDiscount;
                    }
                    const taxableValue = amount - itemDiscount;
                    const gstRate = item.product.gst_rate || 0;
                    const gstAmount = taxableValue * (gstRate / 100);
                    const total = taxableValue + gstAmount;

                    return (
                      <tr
                        key={item.product.sku}
                        className="border-b border-zinc-800"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-white whitespace-nowrap">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            SKU: {item.product.sku}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">
                          {formatCurrency(rate)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-red-400">
                          -{formatCurrency(itemDiscount)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">
                          {formatCurrency(taxableValue)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">
                          <div className="flex flex-col items-end">
                            <span>+{formatCurrency(gstAmount)}</span>
                            <span className="text-xs text-zinc-500">
                              @{gstRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-cyan-400">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Footer Section (Unchanged) --- */}
          <div className="border-t border-zinc-800 pt-4 text-center">
            <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Clock size={12} />
              Order Placed On {order.order_date}
            </p>
          </div>
        </div>
      )}
    </ModalLayout>
  );
};
