import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types";

/**
 * Yeh component Order ka status dikhane ke liye ek aakarshak badge banata hai.
 * @param status - Order ka current status (e.g., "Pending", "Shipped").
 */
export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const statusMap: Record<OrderStatus, string> = {
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Processing: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    In_Transit: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Delivered: "bg-green-500/10 text-green-400 border-green-500/20",
    Cancelled: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    Returned: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full inline-block",
        statusMap[status] || "bg-gray-500/10 text-gray-400"
      )}
    >
      {status}
    </span>
  );
};

/**
 * Yeh component Payment ka status dikhane ke liye ek aakarshak badge banata hai.
 * @param status - Payment ka current status (e.g., "Paid", "Unpaid").
 */
export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({
  status,
}) => {
  const statusMap: Record<PaymentStatus, string> = {
    Paid: "bg-green-500/10 text-green-400 border-green-500/20",
    Unpaid: "bg-red-500/10 text-red-400 border-red-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    COD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full inline-block",
        statusMap[status] || "bg-gray-500/10 text-gray-400"
      )}
    >
      {status}
    </span>
  );
};
