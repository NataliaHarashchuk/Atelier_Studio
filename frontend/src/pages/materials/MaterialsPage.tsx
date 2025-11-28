import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { materialsApi } from "@/api/materials.api";
import {
  MaterialResponse,
  InventoryStats,
  MaterialUnit,
} from "@/types/material.types";
import { MaterialsTable } from "@/components/features/materials/MaterialsTable";
import { MaterialForm } from "@/components/features/materials/MaterialForm";
import { UpdateQuantityForm } from "@/components/features/materials/UpdateQuantityForm";
import { InventoryStatsComponent } from "@/components/features/materials/InventoryStats";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/common/Select";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/common/Checkbox";
import {
  MaterialFormData,
  UpdateQuantityFormData,
  MATERIAL_UNITS,
} from "@/validations/material.validation";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { UserRole } from "@/types/common.types";
import { useAuthStore } from "@/store/authStore";

const MaterialsPage = () => {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateQuantityModalOpen, setIsUpdateQuantityModalOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    useState<MaterialResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const [materialsResponse, statsResponse] = await Promise.all([
        materialsApi.getMaterials({
          search: debouncedSearch || undefined,
          unit: filterUnit || undefined,
          lowStock: showLowStock || undefined,
          page: currentPage,
          limit: 10,
        }),
        materialsApi.getInventoryStats(),
      ]);
      setMaterials(materialsResponse.data);
      setTotalPages(materialsResponse.pagination.totalPages);
      setStats(statsResponse);
    } catch (error) {
      console.error("Failed to load materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lowStockParam = searchParams.get("lowStock");
    if (lowStockParam === "true") {
      setShowLowStock(true);
    }
    loadMaterials();
  }, [debouncedSearch, filterUnit, showLowStock, currentPage, searchParams]);

  const handleCreate = async (data: MaterialFormData) => {
    setIsSubmitting(true);
    try {
      await materialsApi.createMaterial(data);
      toast.success("Матеріал успішно додано!");
      setIsCreateModalOpen(false);
      loadMaterials();
    } catch (error) {
      console.error("Failed to create material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: MaterialFormData) => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      await materialsApi.updateMaterial(selectedMaterial.id, data);
      toast.success("Дані матеріалу оновлено!");
      setIsEditModalOpen(false);
      setSelectedMaterial(null);
      loadMaterials();
    } catch (error) {
      console.error("Failed to update material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuantity = async (data: UpdateQuantityFormData) => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      await materialsApi.updateMaterialQuantity(selectedMaterial.id, data);
      toast.success("Кількість оновлено!");
      setIsUpdateQuantityModalOpen(false);
      setSelectedMaterial(null);
      loadMaterials();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      await materialsApi.deleteMaterial(selectedMaterial.id);
      toast.success("Матеріал видалено!");
      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);
      loadMaterials();
    } catch (error) {
      console.error("Failed to delete material:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitOptions = [
    { value: "", label: "Всі одиниці" },
    ...MATERIAL_UNITS.map((unit) => ({ value: unit, label: unit })),
  ];

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Склад</h1>
          {[UserRole.ADMIN, UserRole.MANAGER].includes(
            user?.role as UserRole,
          ) && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="w-5 h-5" />
                Додати матеріал
              </Button>
            </>
          )}
        </div>

        {}
        {stats && <InventoryStatsComponent stats={stats} />}

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
          <SearchInput
            placeholder="Пошук матеріалів..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />

          <Select
            options={unitOptions}
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value);
            }}
            placeholder="Одиниця виміру"
          />

          <div className="flex items-center">
            <Checkbox
              label="Тільки низький запас"
              checked={showLowStock}
              onChange={(e) => {
                setShowLowStock(e.target.checked);
              }}
            />
          </div>
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
              <MaterialsTable
                materials={materials}
                onEdit={(material) => {
                  setSelectedMaterial(material);
                  setIsEditModalOpen(true);
                }}
                onDelete={(material) => {
                  setSelectedMaterial(material);
                  setIsDeleteDialogOpen(true);
                }}
                onUpdateQuantity={(material) => {
                  setSelectedMaterial(material);
                  setIsUpdateQuantityModalOpen(true);
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
        title="Новий матеріал"
      >
        <MaterialForm
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
          setSelectedMaterial(null);
        }}
        title="Редагування матеріалу"
      >
        {selectedMaterial && (
          <MaterialForm
            onSubmit={handleEdit}
            defaultValues={{
              name: selectedMaterial.name,
              quantity: selectedMaterial.quantity,
              unit: selectedMaterial.unit as MaterialUnit,
              pricePerUnit: selectedMaterial.pricePerUnit,
            }}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedMaterial(null);
            }}
          />
        )}
      </Modal>

      {}
      <Modal
        isOpen={isUpdateQuantityModalOpen}
        onClose={() => {
          setIsUpdateQuantityModalOpen(false);
          setSelectedMaterial(null);
        }}
        title={`Оновити кількість: ${selectedMaterial?.name}`}
      >
        {selectedMaterial && (
          <UpdateQuantityForm
            onSubmit={handleUpdateQuantity}
            currentQuantity={selectedMaterial.quantity}
            unit={selectedMaterial.unit}
            isLoading={isSubmitting}
            onCancel={() => {
              setIsUpdateQuantityModalOpen(false);
              setSelectedMaterial(null);
            }}
          />
        )}
      </Modal>

      {}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedMaterial(null);
        }}
        onConfirm={handleDelete}
        title="Видалення матеріалу"
        message={`Ви впевнені, що хочете видалити матеріал "${selectedMaterial?.name}"? Цю дію неможливо скасувати.`}
        confirmText="Видалити"
        isLoading={isSubmitting}
      />
    </Layout>
  );
};

export default MaterialsPage;
