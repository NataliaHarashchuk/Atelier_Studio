import { Link } from "react-router-dom";
import { OrderWithRelations } from "@/types/order.types";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface RecentOrdersProps {
  orders: OrderWithRelations[];
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
  maxItems?: number;
  variant?: "warning" | "danger" | "info";
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({
  orders,
  title,
  icon,
  emptyMessage,
  maxItems = 5,
  variant = "info",
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Очікує",
      },
      IN_PROGRESS: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "В роботі",
      },
      DONE: { bg: "bg-green-100", text: "text-green-800", label: "Виконано" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const variantStyles = {
    warning: {
      border: "border-orange-200",
      bg: "bg-orange-50",
      hover: "hover:bg-orange-100",
      text: "text-orange-600",
    },
    danger: {
      border: "border-red-200",
      bg: "bg-red-50",
      hover: "hover:bg-red-100",
      text: "text-red-600",
    },
    info: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
      text: "text-blue-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">
          {title} ({orders.length})
        </h2>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <>
          <div className="space-y-3">
            {orders.slice(0, maxItems).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className={`block p-4 border ${styles.border} ${styles.bg} rounded-lg ${styles.hover} transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {order.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Клієнт: {order.client.name}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <span
                    className={`font-medium ${styles.text} flex items-center gap-1`}
                  >
                    <Calendar className="w-4 h-4" />
                    {format(new Date(order.deadline), "dd MMM yyyy", {
                      locale: uk,
                    })}
                  </span>
                  <span>•</span>
                  <span>{order.price} грн</span>
                  {order.assignedEmployee && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {order.assignedEmployee.name}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {orders.length > maxItems && (
            <Link
              to="/orders"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 pt-4 border-t"
            >
              Показати всі ({orders.length})
            </Link>
          )}
        </>
      )}
    </div>
  );
};
