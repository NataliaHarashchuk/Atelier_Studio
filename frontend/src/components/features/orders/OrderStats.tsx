import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import { OrderStats } from "@/types/order.types";
import { ClipboardList, DollarSign, Clock, CheckCircle } from "lucide-react";

interface OrderStatsProps {
  stats: OrderStats;
}

export const OrderStatsComponent: React.FC<OrderStatsProps> = ({ stats }) => {
  const { user } = useAuthStore();
  const totalOrders =
    stats.byStatus.pending + stats.byStatus.inProgress + stats.byStatus.done;

  const statCards = [
    {
      title: "Всього замовлень",
      value: totalOrders,
      icon: <ClipboardList className="w-6 h-6" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      isHidden: false,
    },
    {
      title: "Загальний дохід",
      value: `${Number(stats.totalRevenue).toFixed(2)} грн`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-green-600",
      bg: "bg-green-50",
      isHidden: user?.role === UserRole.MASTER,
    },
    {
      title: "Наближені дедлайни",
      value: stats.upcomingDeadlines,
      icon: <Clock className="w-6 h-6" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      isHidden: false,
    },
    {
      title: "Виконано",
      value: stats.byStatus.done,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-green-600",
      bg: "bg-green-50",
      isHidden: false,
    },
  ].filter((card) => !card.isHidden);

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            За статусами
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Очікує</span>
              <span className="font-semibold text-yellow-600">
                {stats.byStatus.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">В роботі</span>
              <span className="font-semibold text-blue-600">
                {stats.byStatus.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Виконано</span>
              <span className="font-semibold text-green-600">
                {stats.byStatus.done}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            За типами
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Пошиття</span>
              <span className="font-semibold text-gray-900">
                {stats.byType.sewing}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ремонт</span>
              <span className="font-semibold text-gray-900">
                {stats.byType.repair}
              </span>
            </div>
            {[UserRole.ADMIN, UserRole.MANAGER].includes(
              user?.role as UserRole,
            ) && (
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-gray-600">Середня ціна</span>
                <span className="font-semibold text-gray-900">
                  {Number(stats.averagePrice).toFixed(2)} грн
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
