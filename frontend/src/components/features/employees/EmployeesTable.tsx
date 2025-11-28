import { Link } from "react-router-dom";
import { EmployeeWithStats } from "@/types/employee.types";
import {
  Eye,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/common/Button";

interface EmployeesTableProps {
  employees: EmployeeWithStats[];
  onEdit: (employee: EmployeeWithStats) => void;
  onDelete: (employee: EmployeeWithStats) => void;
  onCreateAccount: (employee: EmployeeWithStats) => void;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  onEdit,
  onDelete,
  onCreateAccount,
}) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Працівників не знайдено</p>
      </div>
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

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Посада</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Обліковий запис</th>
            <th>Замовлень</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="font-medium text-gray-900">{employee.name}</td>
              <td className="text-gray-600">{employee.position}</td>
              <td className="text-gray-600">{employee.email}</td>
              <td className="text-gray-600">{employee.phone}</td>
              <td>
                {employee.user ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {getRoleName(employee.user.role)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Немає</span>
                  </div>
                )}
              </td>
              <td>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {employee._count.orders}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Link to={`/employees/${employee.id}`}>
                    <Button variant="ghost" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={() => {
                      onEdit(employee);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!employee.user && (
                    <Button
                      variant="ghost"
                      className="p-2 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        onCreateAccount(employee);
                      }}
                      title="Створити обліковий запис"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="p-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onDelete(employee);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
