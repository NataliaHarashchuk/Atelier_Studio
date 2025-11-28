import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ordersApi } from "@/api/orders.api";
import { materialsApi } from "@/api/materials.api";
import { OrderWithRelations, OrderStats } from "@/types/order.types";
import { MaterialResponse, InventoryStats } from "@/types/material.types";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import {
  ClipboardList,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const DashboardPage = () => {
  const { user, hasRole } = useAuthStore();
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(
    null,
  );
  const [upcomingOrders, setUpcomingOrders] = useState<OrderWithRelations[]>(
    [],
  );
  const [overdueOrders, setOverdueOrders] = useState<OrderWithRelations[]>([]);
  const [lowStockMaterials, setLowStockMaterials] = useState<
    MaterialResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const canViewClients = hasRole([UserRole.ADMIN, UserRole.MANAGER]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          orderStatsData,
          inventoryStatsData,
          upcomingData,
          overdueData,
          lowStockData,
        ] = await Promise.all([
          ordersApi.getOrderStats(),
          materialsApi.getInventoryStats(),
          ordersApi.getUpcomingDeadlines(),
          ordersApi.getOverdueOrders(),
          materialsApi.getLowStockMaterials(),
        ]);

        setOrderStats(orderStatsData);
        setInventoryStats(inventoryStatsData);
        setUpcomingOrders(upcomingData);
        setOverdueOrders(overdueData);
        setLowStockMaterials(lowStockData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-4 ml-4">Завантаження...</p>
        </div>
      </Layout>
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

  const totalOrders = orderStats
    ? orderStats.byStatus.pending +
      orderStats.byStatus.inProgress +
      orderStats.byStatus.done
    : 0;

  return (
    <Layout>
      <div>
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Вітаємо, {user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ось огляд діяльності ательє на сьогодні
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {}
          <Link to="/orders" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всього замовлень</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">В роботі</span>
                <span className="font-semibold text-blue-600">
                  {orderStats?.byStatus.inProgress || 0}
                </span>
              </div>
            </div>
          </Link>

          {}
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Загальний дохід</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Number(orderStats?.totalRevenue).toFixed(0) || 0}
                  <span className="text-lg"> грн</span>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Середній чек</span>
                <span className="font-semibold text-green-600">
                  {Number(orderStats?.averagePrice).toFixed(0) || 0} грн
                </span>
              </div>
            </div>
          </div>

          {}
          <Link
            to="/materials"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Матеріалів</p>
                <p className="text-3xl font-bold text-gray-900">
                  {inventoryStats?.totalMaterials || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Низький запас</span>
                <span className="font-semibold text-red-600">
                  {inventoryStats?.lowStockItems || 0}
                </span>
              </div>
            </div>
          </Link>

          {}
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Виконано</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orderStats?.byStatus.done || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>Успішно завершено</span>
              </div>
            </div>
          </div>
        </div>

        {}
        {canViewClients && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              to="/orders"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <ClipboardList className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Замовлення
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Керування всіма замовленнями
              </p>
            </Link>

            <Link
              to="/clients"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Клієнти</h3>
              <p className="text-sm text-gray-600 mt-1">База клієнтів</p>
            </Link>

            <Link
              to="/materials"
              className="card hover:shadow-lg transition-shadow text-center"
            >
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Склад</h3>
              <p className="text-sm text-gray-600 mt-1">
                Управління матеріалами
              </p>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          {overdueOrders.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Прострочені замовлення ({overdueOrders.length})
                </h2>
              </div>

              <div className="space-y-3">
                {overdueOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Клієнт: {order.client.name}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="text-red-600 font-medium">
                        Дедлайн:{" "}
                        {format(new Date(order.deadline), "dd MMM yyyy", {
                          locale: uk,
                        })}
                      </span>
                      <span>•</span>
                      <span>{order.price} грн</span>
                    </div>
                  </Link>
                ))}
              </div>

              {overdueOrders.length > 5 && (
                <Link
                  to="/orders?status=overdue"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 pt-4 border-t"
                >
                  Показати всі ({overdueOrders.length})
                </Link>
              )}
            </div>
          )}

          {}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Наближені дедлайни ({upcomingOrders.length})
              </h2>
            </div>

            {upcomingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Немає замовлень з наближеним дедлайном
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {upcomingOrders.slice(0, 5).map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="block p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {order.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Клієнт: {order.client.name}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="text-orange-600 font-medium">
                          Дедлайн:{" "}
                          {format(new Date(order.deadline), "dd MMM yyyy", {
                            locale: uk,
                          })}
                        </span>
                        <span>•</span>
                        <span>{order.price} грн</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {upcomingOrders.length > 5 && (
                  <Link
                    to="/orders"
                    className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 pt-4 border-t"
                  >
                    Показати всі ({upcomingOrders.length})
                  </Link>
                )}
              </>
            )}
          </div>

          {}
          {lowStockMaterials.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Низький запас ({lowStockMaterials.length})
                </h2>
              </div>

              <div className="space-y-3">
                {lowStockMaterials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {material.name}
                        </h3>
                        <p className="text-sm text-red-600 mt-1">
                          Залишилось: {material.quantity} {material.unit}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Number(material.pricePerUnit).toFixed(2)} грн/
                        {material.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/materials?lowStock=true"
                className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4 pt-4 border-t"
              >
                Переглянути всі
              </Link>
            </div>
          )}

          {}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Статистика замовлень
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Очікує</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {orderStats?.byStatus.pending || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        totalOrders
                          ? ((orderStats?.byStatus.pending || 0) /
                              totalOrders) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">В роботі</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {orderStats?.byStatus.inProgress || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        totalOrders
                          ? ((orderStats?.byStatus.inProgress || 0) /
                              totalOrders) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Виконано</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {orderStats?.byStatus.done || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        totalOrders
                          ? ((orderStats?.byStatus.done || 0) / totalOrders) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                За типами
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats?.byType.sewing || 0}
                  </p>
                  <p className="text-sm text-gray-600">Пошиття</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats?.byType.repair || 0}
                  </p>
                  <p className="text-sm text-gray-600">Ремонт</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
