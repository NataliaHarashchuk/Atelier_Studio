import { Link } from "react-router-dom";
import { ClientWithStats } from "@/types/client.types";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";

interface ClientsTableProps {
  clients: ClientWithStats[];
  onEdit: (client: ClientWithStats) => void;
  onDelete: (client: ClientWithStats) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onEdit,
  onDelete,
}) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Клієнтів не знайдено</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Замовлень</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="font-medium text-gray-900">{client.name}</td>
              <td className="text-gray-600">
                {client.email || (
                  <span className="text-gray-400">Не вказано</span>
                )}
              </td>
              <td className="text-gray-600">{client.phone}</td>
              <td>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {client._count.orders}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Link to={`/clients/${client.id}`}>
                    <Button variant="ghost" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={() => {
                      onEdit(client);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="p-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onDelete(client);
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
