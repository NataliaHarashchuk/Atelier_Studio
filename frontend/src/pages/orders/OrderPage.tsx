import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ordersApi } from "@/api/orders.api";
import { OrderWithRelations, OrderStats } from "@/types/order.types";
import { OrderType, OrderStatus } from "@/types/common.types";
import { OrdersTable } from "@/components/features/orders/OrdersTable";
import { OrderForm } from "@/components/features/orders/OrderForm";
import { OrderStatsComponent } from "@/components/features/orders/OrderStats";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/Select";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/common/Button";
import { OrderFormData } from "@/validations/order.validation";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { AxiosError } from "axios";

const OrdersPage = () => {
  const { hasRole } = useAuthStore();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const canCreateEdit = hasRole([UserRole.ADMIN, UserRole.MANAGER]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const [ordersResponse, statsResponse] = await Promise.all([
        ordersApi.getOrders({
          search: debouncedSearch || undefined,
          status: filterStatus ? (filterStatus as OrderStatus) : undefined,
          type: filterType ? (filterType as OrderType) : undefined,
          page: currentPage,
          limit: 10,
        }),
        ordersApi.getOrderStats(),
      ]);
      setOrders(ordersResponse.data);
      setTotalPages(ordersResponse.pagination.totalPages);
      setStats(statsResponse);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [debouncedSearch, filterStatus, filterType, currentPage]);

  const handleCreate = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      const createData = {
        ...data,
        photo: data.photo?.[0],
      };
      await ordersApi.createOrder(createData);
      toast.success("Замовлення успішно створено!");
      setIsCreateModalOpen(false);
      loadOrders();
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: OrderFormData) => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        photo: data.photo?.[0],
      };
      await ordersApi.updateOrder(selectedOrder.id, updateData);
      toast.success("Замовлення оновлено!");
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err: unknown) {
      const error = err as AxiosError<{ errors: unknown }>;
      console.error("Failed to update order:", error);
      if (error.response) {
        console.log("🛑 SERVER VALIDATION ERRORS:", error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      await ordersApi.deleteOrder(selectedOrder.id);
      toast.success("Замовлення видалено!");
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "", label: "Всі статуси" },
    { value: OrderStatus.PENDING, label: "Очікує" },
    { value: OrderStatus.IN_PROGRESS, label: "В роботі" },
    { value: OrderStatus.DONE, label: "Виконано" },
  ];

  const typeOptions = [
    { value: "", label: "Всі типи" },
    { value: OrderType.SEWING, label: "Пошиття" },
    { value: OrderType.REPAIR, label: "Ремонт" },
  ];

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Замовлення</h1>
          {canCreateEdit && (
            <Button
              variant="primary"
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Нове замовлення
            </Button>
          )}
        </div>

        {}
        {stats && <OrderStatsComponent stats={stats} />}

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
          <SearchInput
            placeholder="Пошук замовлень..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />

          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
            }}
          />

          <Select
            options={typeOptions}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
            }}
          />
        </div>

        {}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-4">Завантаження...</p>
            </div>
          ) : (
            <>
              <OrdersTable
                orders={orders}
                onEdit={(order) => {
                  if (canCreateEdit) {
                    setSelectedOrder(order);
                    setIsEditModalOpen(true);
                  }
                }}
                onDelete={(order) => {
                  if (hasRole([UserRole.ADMIN])) {
                    setSelectedOrder(order);
                    setIsDeleteDialogOpen(true);
                  }
                }}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {}
      {canCreateEdit && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
          title="Нове замовлення"
          size="lg"
        >
          <OrderForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsCreateModalOpen(false);
            }}
          />
        </Modal>
      )}

      {}
      {canCreateEdit && selectedOrder && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOrder(null);
          }}
          title="Редагування замовлення"
          size="lg"
        >
          <OrderForm
            onSubmit={handleEdit}
            defaultValues={{
              title: selectedOrder.title,
              type: selectedOrder.type,
              deadline: selectedOrder.deadline.slice(0, 16),
              price: selectedOrder.price,
              description: selectedOrder.description || "",
              clientId: selectedOrder.clientId,
              assignedEmployeeId: selectedOrder.assignedEmployeeId,
              status: selectedOrder.status,
            }}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedOrder(null);
            }}
            isEdit={true}
            currentPhotoUrl={selectedOrder.photoUrl}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDelete}
        title="Видалення замовлення"
        message={`Ви впевнені, що хочете видалити замовлення "${selectedOrder?.title}"? Цю дію неможливо скасувати.`}
        confirmText="Видалити"
        isLoading={isSubmitting}
      />
    </Layout>
  );
};

export default OrdersPage;
