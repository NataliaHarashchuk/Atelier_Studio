import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import { InventoryStats } from "@/types/material.types";
import { DollarSign, AlertTriangle, Box } from "lucide-react";

interface InventoryStatsProps {
  stats: InventoryStats;
}

export const InventoryStatsComponent: React.FC<InventoryStatsProps> = ({
  stats,
}) => {
  const { user } = useAuthStore();

  const statCards = [
    {
      title: "Всього матеріалів",
      value: stats.totalMaterials,
      icon: <Box className="w-6 h-6" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: "Загальна вартість",
      value: `${stats.totalValue.toFixed(2)} грн`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-green-600",
      bg: "bg-green-50",
      allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: "Низький запас",
      value: stats.lowStockItems,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "text-red-600",
      bg: "bg-red-50",
      allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.MASTER],
    },
  ];

  const visibleCards = statCards.filter(
    (card) => user?.role && card.allowedRoles.includes(user.role),
  );

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleCards.map((stat, index) => (
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
      {stats.byUnit.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            За одиницями виміру
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.byUnit.map((unitStat, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <p className="text-sm text-gray-600 mb-1">{unitStat.unit}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {unitStat.count} позицій
                </p>
                <p className="text-sm text-gray-500">
                  {unitStat.totalQuantity.toFixed(2)} {unitStat.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
