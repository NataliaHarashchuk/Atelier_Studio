import { MaterialResponse } from "@/types/material.types";
import { Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";

interface MaterialsTableProps {
  materials: MaterialResponse[];
  onEdit: (material: MaterialResponse) => void;
  onDelete: (material: MaterialResponse) => void;
  onUpdateQuantity: (material: MaterialResponse) => void;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  onEdit,
  onDelete,
  onUpdateQuantity,
}) => {
  const { user } = useAuthStore();

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Матеріалів не знайдено</p>
      </div>
    );
  }

  const LOW_STOCK_THRESHOLD = 10;

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Назва</th>
            <th>Кількість</th>
            <th>Одиниця</th>
            {[UserRole.ADMIN, UserRole.MANAGER].includes(
              user?.role as UserRole,
            ) && (
              <>
                <th>Ціна за одиницю</th>
                <th>Загальна вартість</th>
                <th>Дії</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => {
            const isLowStock = material.quantity < LOW_STOCK_THRESHOLD;

            return (
              <tr key={material.id}>
                <td className="font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {material.name}
                    {isLowStock && (
                      <div title="Низький запас" className="inline-flex">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={
                      isLowStock
                        ? "text-red-600 font-semibold"
                        : "text-gray-900"
                    }
                  >
                    {material.quantity}
                  </span>
                </td>
                <td className="text-gray-600">{material.unit}</td>

                {[UserRole.ADMIN, UserRole.MANAGER].includes(
                  user?.role as UserRole,
                ) && (
                  <>
                    <td className="text-gray-600">
                      {Number(material.pricePerUnit).toFixed(2)} грн
                    </td>

                    <td className="font-medium text-gray-900">
                      {Number(material.totalValue).toFixed(2)} грн
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="p-2 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            onUpdateQuantity(material);
                          }}
                          title="Оновити кількість"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-2"
                          onClick={() => {
                            onEdit(material);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-2 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            onDelete(material);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
