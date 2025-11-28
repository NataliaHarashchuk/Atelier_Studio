import { Link } from "react-router-dom";
import { OrderWithRelations } from "@/types/order.types";
import { Eye, Edit, Trash2, Calendar, User } from "lucide-react";
import { Button } from "@/components/common/Button";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";

interface OrdersTableProps {
  orders: OrderWithRelations[];
  onEdit: (order: OrderWithRelations) => void;
  onDelete: (order: OrderWithRelations) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Замовлень не знайдено</p>
      </div>
    );
  }

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

  const getTypeBadge = (type: string) => {
    return type === "SEWING" ? (
      <span className="text-sm text-gray-600">Пошиття</span>
    ) : (
      <span className="text-sm text-gray-600">Ремонт</span>
    );
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== "DONE";
  };

  const canViewClient = [UserRole.ADMIN, UserRole.MANAGER].includes(
    user?.role as UserRole,
  );

  const Wrapper = canViewClient ? Link : "div";

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Назва</th>
            <th>Клієнт</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Дедлайн</th>
            {[UserRole.ADMIN, UserRole.MANAGER].includes(
              user?.role as UserRole,
            ) && (
              <>
                <th>Працівник</th>
                <th>Ціна</th>
              </>
            )}

            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const overdue = isOverdue(order.deadline, order.status);

            return (
              <tr key={order.id}>
                <td className="font-medium text-gray-900">{order.title}</td>
                <td>
                  <Wrapper
                    to={canViewClient ? `/clients/${order.client.id}}` : ""}
                    className="text-primary-600 hover:underline"
                  >
                    {order.client.name}
                  </Wrapper>
                </td>
                <td>{getTypeBadge(order.type)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span
                      className={
                        overdue ? "text-red-600 font-semibold" : "text-gray-600"
                      }
                    >
                      {format(new Date(order.deadline), "dd MMM yyyy", {
                        locale: uk,
                      })}
                    </span>
                  </div>
                </td>
                {[UserRole.ADMIN, UserRole.MANAGER].includes(
                  user?.role as UserRole,
                ) && (
                  <>
                    <td>
                      {order.assignedEmployee ? (
                        <Link
                          to={`/employees/${order.assignedEmployee.id}`}
                          className="flex items-center gap-2 text-primary-600 hover:underline"
                        >
                          <User className="w-4 h-4" />
                          {order.assignedEmployee.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Не призначено
                        </span>
                      )}
                    </td>

                    <td className="font-medium text-gray-900">
                      {order.price} грн
                    </td>
                  </>
                )}

                <td>
                  <div className="flex items-center gap-2">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="ghost" className="p-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {[UserRole.ADMIN, UserRole.MANAGER].includes(
                      user?.role as UserRole,
                    ) && (
                      <>
                        <Button
                          variant="ghost"
                          className="p-2"
                          onClick={() => {
                            onEdit(order);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          className="p-2 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            onDelete(order);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
