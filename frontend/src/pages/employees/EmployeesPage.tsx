import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { employeesApi } from "@/api/employees.api";
import { EmployeeWithStats } from "@/types/employee.types";
import { EmployeesTable } from "@/components/features/employees/EmployeesTable";
import { EmployeeForm } from "@/components/features/employees/EmployeeForm";
import { CreateAccountForm } from "@/components/features/employees/CreateAccountForm";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/common/Button";
import { EmployeeFormData } from "@/validations/employee.validation";
import { CreateAccountFormData } from "@/validations/employee.validation";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await employeesApi.getEmployees({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
      });
      setEmployees(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, [debouncedSearch, currentPage]);

  const handleCreate = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await employeesApi.createEmployee(data);
      toast.success("Працівника успішно створено!");
      setIsCreateModalOpen(false);
      void loadEmployees();
    } catch (error) {
      console.error("Failed to create employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: EmployeeFormData) => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await employeesApi.updateEmployee(selectedEmployee.id, {
        name: data.name,
        position: data.position,
        salary: data.salary,
        phone: data.phone,
        email: data.email,
      });
      toast.success("Дані працівника оновлено!");
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      void loadEmployees();
    } catch (error) {
      console.error("Failed to update employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (data: CreateAccountFormData) => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await employeesApi.createAccountForEmployee(selectedEmployee.id, data);
      toast.success("Обліковий запис створено!");
      setIsCreateAccountModalOpen(false);
      setSelectedEmployee(null);
      void loadEmployees();
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      await employeesApi.deleteEmployee(selectedEmployee.id);
      toast.success("Працівника видалено!");
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      void loadEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Працівники</h1>
          <Button
            variant="primary"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Додати працівника
          </Button>
        </div>

        {}
        <div className="mb-6">
          <SearchInput
            placeholder="Пошук працівників..."
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
              <EmployeesTable
                employees={employees}
                onEdit={(employee) => {
                  setSelectedEmployee(employee);
                  setIsEditModalOpen(true);
                }}
                onDelete={(employee) => {
                  setSelectedEmployee(employee);
                  setIsDeleteDialogOpen(true);
                }}
                onCreateAccount={(employee) => {
                  setSelectedEmployee(employee);
                  setIsCreateAccountModalOpen(true);
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
        title="Новий працівник"
        size="lg"
      >
        <EmployeeForm
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
          setSelectedEmployee(null);
        }}
        title="Редагування працівника"
      >
        {selectedEmployee && (
          <EmployeeForm
            onSubmit={handleEdit}
            defaultValues={{
              name: selectedEmployee.name,
              position: selectedEmployee.position,
              salary: selectedEmployee.salary,
              phone: selectedEmployee.phone,
              email: selectedEmployee.email,
            }}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            }}
            isEdit={true}
          />
        )}
      </Modal>

      {}
      <Modal
        isOpen={isCreateAccountModalOpen}
        onClose={() => {
          setIsCreateAccountModalOpen(false);
          setSelectedEmployee(null);
        }}
        title={`Створити обліковий запис для ${selectedEmployee?.name}`}
      >
        <CreateAccountForm
          onSubmit={handleCreateAccount}
          isLoading={isSubmitting}
          onCancel={() => {
            setIsCreateAccountModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      </Modal>

      {}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDelete}
        title="Видалення працівника"
        message={`Ви впевнені, що хочете видалити працівника "${selectedEmployee?.name}"? Цю дію неможливо скасувати.`}
        confirmText="Видалити"
        isLoading={isSubmitting}
      />
    </Layout>
  );
};

export default EmployeesPage;
