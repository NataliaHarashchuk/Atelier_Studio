import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ordersApi } from "@/api/orders.api";
import { OrderWithRelations, OrderStats } from "@/types/order.types";
import { useAuthStore } from "@/store/authStore";
import { RecentOrders } from "@/components/features/dashboard/RecentOrders";
import { QuickStat } from "@/components/features/dashboard/QuickStats";
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  User,
} from "lucide-react";

const MasterDashboard = () => {
  const { user } = useAuthStore();
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [upcomingOrders, setUpcomingOrders] = useState<OrderWithRelations[]>(
    [],
  );
  const [overdueOrders, setOverdueOrders] = useState<OrderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [stats, upcoming, overdue] = await Promise.all([
          ordersApi.getOrderStats(),
          ordersApi.getUpcomingDeadlines(),
          ordersApi.getOverdueOrders(),
        ]);

        setOrderStats(stats);
        setUpcomingOrders(upcoming);
        setOverdueOrders(overdue);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-4">Завантаження даних...</p>
        </div>
      </Layout>
    );
  }

  const totalOrders = orderStats
    ? orderStats.byStatus.pending +
      orderStats.byStatus.inProgress +
      orderStats.byStatus.done
    : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Вітаємо, {user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">Ось ваші замовлення на сьогодні</p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStat
            title="Мої замовлення"
            value={totalOrders}
            icon={ClipboardList}
            color="text-blue-600"
            bgColor="bg-blue-50"
            link="/orders"
            subtitle="В роботі"
            subtitleValue={orderStats?.byStatus.inProgress || 0}
          />

          <QuickStat
            title="Очікують"
            value={orderStats?.byStatus.pending || 0}
            icon={Clock}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            link="/orders?status=PENDING"
            subtitle="Потребують уваги"
          />

          <QuickStat
            title="Виконано"
            value={orderStats?.byStatus.done || 0}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-50"
            link="/orders?status=DONE"
            subtitle={`${totalOrders ? (((orderStats?.byStatus.done || 0) / totalOrders) * 100).toFixed(0) : 0}% завершено`}
          />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          {overdueOrders.length > 0 && (
            <RecentOrders
              orders={overdueOrders}
              title="Прострочені замовлення"
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              emptyMessage="Немає прострочених замовлень"
              variant="danger"
            />
          )}

          {}
          <RecentOrders
            orders={upcomingOrders}
            title="Наближені дедлайни"
            icon={<Clock className="w-6 h-6 text-orange-600" />}
            emptyMessage="Немає замовлень з наближеним дедлайном"
            variant="warning"
          />
        </div>

        {}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Швидкі дії
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/orders"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <ClipboardList className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Мої замовлення</p>
              <p className="text-sm text-gray-600 mt-1">
                Всього: {totalOrders}
              </p>
            </Link>

            <Link
              to="/materials"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <Package className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Склад матеріалів</p>
              <p className="text-sm text-gray-600 mt-1">Переглянути</p>
            </Link>

            <Link
              to="/profile"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
            >
              <User className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Мій профіль</p>
              <p className="text-sm text-gray-600 mt-1">Налаштування</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MasterDashboard;
