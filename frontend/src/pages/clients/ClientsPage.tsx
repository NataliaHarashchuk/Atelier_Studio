import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { clientsApi } from "@/api/clients.api";
import { ClientWithStats } from "@/types/client.types";
import { ClientsTable } from "@/components/features/clients/ClientsTable";
import { ClientForm } from "@/components/features/clients/ClientForm";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/common/Button";
import { ClientFormData } from "@/validations/client.validation";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

const ClientsPage = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await clientsApi.getClients({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
      });
      setClients(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, [debouncedSearch, currentPage]);

  const handleCreate = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      await clientsApi.createClient(data);
      toast.success("Клієнта успішно створено!");
      setIsCreateModalOpen(false);
      void loadClients();
    } catch (error) {
      console.error("Failed to create client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: ClientFormData) => {
    if (!selectedClient) return;

    setIsSubmitting(true);
    try {
      await clientsApi.updateClient(selectedClient.id, data);
      toast.success("Дані клієнта оновлено!");
      setIsEditModalOpen(false);
      setSelectedClient(null);
      void loadClients();
    } catch (error) {
      console.error("Failed to update client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    setIsSubmitting(true);
    try {
      await clientsApi.deleteClient(selectedClient.id);
      toast.success("Клієнта видалено!");
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      void loadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Клієнти</h1>
          <Button
            variant="primary"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Додати клієнта
          </Button>
        </div>

        {}
        <div className="mb-6">
          <SearchInput
            placeholder="Пошук клієнтів..."
            value={searchQuery}
            onSearch={setSearchQuery}
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
              <ClientsTable
                clients={clients}
                onEdit={(client) => {
                  setSelectedClient(client);
                  setIsEditModalOpen(true);
                }}
                onDelete={(client) => {
                  setSelectedClient(client);
                  setIsDeleteDialogOpen(true);
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
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        title="Новий клієнт"
      >
        <ClientForm
          onSubmit={handleCreate}
          isLoading={isSubmitting}
          onCancel={() => {
            setIsCreateModalOpen(false);
          }}
        />
      </Modal>

      {}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        title="Редагування клієнта"
      >
        {selectedClient && (
          <ClientForm
            onSubmit={handleEdit}
            defaultValues={{
              name: selectedClient.name,
              email: selectedClient.email || "",
              phone: selectedClient.phone,
            }}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleDelete}
        title="Видалення клієнта"
        message={`Ви впевнені, що хочете видалити клієнта "${selectedClient?.name}"? Цю дію неможливо скасувати.`}
        confirmText="Видалити"
        isLoading={isSubmitting}
      />
    </Layout>
  );
};

export default ClientsPage;
