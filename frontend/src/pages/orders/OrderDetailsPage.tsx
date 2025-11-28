import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ordersApi } from "@/api/orders.api";
import { OrderWithRelations } from "@/types/order.types";
import { OrderStatus } from "@/types/common.types";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  Package,
  Phone,
  Mail,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const OrderDetailsPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const { user, hasRole } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const canUpdateStatus = hasRole([
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.MASTER,
  ]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const orderData = await ordersApi.getOrderById(Number(id));
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to load order:", error);
        navigate("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdatingStatus(true);
    try {
      await ordersApi.updateOrderStatus(order.id, newStatus);
      toast.success("Статус замовлення оновлено!");
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Замовлення не знайдено</p>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<
      OrderStatus,
      { bg: string; text: string; label: string }
    > = {
      [OrderStatus.PENDING]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Очікує",
      },
      [OrderStatus.IN_PROGRESS]: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "В роботі",
      },
      [OrderStatus.DONE]: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Виконано",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const isOverdue =
    new Date(order.deadline) < new Date() && order.status !== "DONE";

  const statusOptions = [
    { value: OrderStatus.PENDING, label: "Очікує" },
    { value: OrderStatus.IN_PROGRESS, label: "В роботі" },
    { value: OrderStatus.DONE, label: "Виконано" },
  ];

  const canViewProfile = [UserRole.ADMIN, UserRole.MANAGER].includes(
    user?.role as UserRole,
  );

  const Wrapper = canViewProfile ? Link : "div";

  return (
    <Layout>
      <div>
        {}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/orders");
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до списку
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {order.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {order.type === "SEWING" ? "Пошиття" : "Ремонт"}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            {order.photoUrl && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Фото замовлення
                </h2>
                <img
                  src={`${API_URL}${order.photoUrl}`}
                  alt={order.title}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            )}

            {}
            {order.description && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Опис</h2>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>
            )}

            {}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Клієнт</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Wrapper
                    to={canViewProfile ? `/clients/${order.client.id}` : ""}
                    className="text-lg font-medium text-primary-600 hover:underline"
                  >
                    {order.client.name}
                  </Wrapper>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{order.client.phone}</span>
                </div>

                {order.client.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{order.client.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-1 space-y-6">
            {}
            {canUpdateStatus && (
              <div className="card">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Змінити статус
                </h3>
                <Select
                  options={statusOptions}
                  value={order.status}
                  onChange={(e) => {
                    void handleStatusChange(e.target.value as OrderStatus);
                  }}
                  disabled={isUpdatingStatus}
                />
              </div>
            )}

            {}
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Деталі</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Дедлайн</p>
                    <p
                      className={`font-medium ${
                        isOverdue ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {format(new Date(order.deadline), "dd MMMM yyyy, HH:mm", {
                        locale: uk,
                      })}
                    </p>
                    {isOverdue && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        Прострочено
                      </p>
                    )}
                  </div>
                </div>

                {[UserRole.ADMIN, UserRole.MANAGER].includes(
                  user?.role as UserRole,
                ) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Ціна</p>
                      <p className="text-xl font-bold text-gray-900">
                        {order.price} грн
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Тип</p>
                    <p className="font-medium text-gray-900">
                      {order.type === "SEWING" ? "Пошиття" : "Ремонт"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Працівник
              </h3>

              {order.assignedEmployee ? (
                <Wrapper
                  to={
                    canViewProfile
                      ? `/employees/${order.assignedEmployee.id}`
                      : ""
                  }
                  className="block"
                >
                  {}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg bg-primary-50 transition-colors ${
                      canViewProfile
                        ? "hover:bg-primary-100 cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.assignedEmployee.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.assignedEmployee.position}
                      </p>
                    </div>
                  </div>
                </Wrapper>
              ) : (
                <p className="text-gray-500 text-sm">
                  Працівник не призначений
                </p>
              )}
            </div>

            {}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Інформація
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Створено</span>
                  <span className="text-gray-900">
                    {format(new Date(order.createdAt), "dd.MM.yyyy", {
                      locale: uk,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Оновлено</span>
                  <span className="text-gray-900">
                    {format(new Date(order.updatedAt), "dd.MM.yyyy", {
                      locale: uk,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailsPage;
