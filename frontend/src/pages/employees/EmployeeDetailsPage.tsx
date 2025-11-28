import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { employeesApi } from "@/api/employees.api";
import { EmployeeWithOrders, EmployeeStats } from "@/types/employee.types";
import { Button } from "@/components/common/Button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const EmployeeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeWithOrders | null>(null);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [employeeData, statsData] = await Promise.all([
          employeesApi.getEmployeeWithOrders(Number(id)),
          employeesApi.getEmployeeStats(Number(id)),
        ]);
        setEmployee(employeeData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load employee data:", error);
        navigate("/employees");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployeeData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!employee || !stats) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Працівника не знайдено</p>
        </div>
      </Layout>
    );
  }

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      ADMIN: "Адміністратор",
      MANAGER: "Менеджер",
      MASTER: "Майстер",
    };
    return roleNames[role] || role;
  };

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

  return (
    <Layout>
      <div>
        {}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/employees");
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до списку
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-1 space-y-6">
            {}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Контактна інформація
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{employee.email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{employee.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span>{employee.position}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>{employee.salary} грн</span>
                </div>
              </div>
            </div>

            {}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Обліковий запис
              </h2>

              {employee.user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Роль</p>
                      <p className="font-medium text-gray-900">
                        {getRoleName(employee.user.role)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    Має доступ до системи
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  Немає облікового запису для доступу до системи
                </div>
              )}
            </div>

            {}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Статистика
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Всього замовлень
                  </span>
                  <span className="font-semibold text-gray-900">
                    {stats.stats.totalOrders}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Загальний дохід</span>
                  <span className="font-semibold text-gray-900">
                    {stats.stats.totalRevenue.toFixed(2)} грн
                  </span>
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  За статусами
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Очікує</span>
                    <span className="font-medium">
                      {stats.stats.ordersByStatus.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">В роботі</span>
                    <span className="font-medium">
                      {stats.stats.ordersByStatus.inProgress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Виконано</span>
                    <span className="font-medium">
                      {stats.stats.ordersByStatus.done}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Замовлення ({employee.orders.length})
              </h2>

              {employee.orders.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Замовлень поки немає</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employee.orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {order.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.type === "SEWING" ? "Пошиття" : "Ремонт"}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Дедлайн:{" "}
                          {format(new Date(order.deadline), "dd MMM yyyy", {
                            locale: uk,
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-gray-900">
                          {order.price} грн
                        </span>
                        <span>•</span>
                        <span>Клієнт: {order.client.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDetailsPage;
