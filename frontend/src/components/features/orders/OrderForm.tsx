import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema, OrderFormData } from "@/validations/order.validation";
import { OrderType, OrderStatus } from "@/types/common.types";
import { clientsApi } from "@/api/clients.api";
import { employeesApi } from "@/api/employees.api";
import { ClientWithStats } from "@/types/client.types";
import { EmployeeWithStats } from "@/types/employee.types";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import { Upload, X } from "lucide-react";

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  defaultValues?: Partial<OrderFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
  isEdit?: boolean;
  currentPhotoUrl?: string | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
  isEdit = false,
  currentPhotoUrl,
}) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    currentPhotoUrl || null,
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues,
  });

  const photo = watch("photo");

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [clientsResponse, employeesResponse] = await Promise.all([
          clientsApi.getClients(),
          employeesApi.getEmployees(),
        ]);
        setClients(clientsResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (photo && photo[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(photo[0]);
    }
  }, [photo]);

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("photo", undefined);
    setPhotoPreview(currentPhotoUrl || null);
  };

  const typeOptions = [
    { value: OrderType.SEWING, label: "Пошиття" },
    { value: OrderType.REPAIR, label: "Ремонт" },
  ];

  const statusOptions = [
    { value: OrderStatus.PENDING, label: "Очікує" },
    { value: OrderStatus.IN_PROGRESS, label: "В роботі" },
    { value: OrderStatus.DONE, label: "Виконано" },
  ];

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.name} (${client.phone})`,
  }));

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.name} - ${employee.position}`,
  }));

  if (isLoadingData) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 mt-4">Завантаження даних...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Назва замовлення"
        {...register("title")}
        error={errors.title?.message}
        placeholder="Пошиття сукні, ремонт штанів..."
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Тип замовлення"
          {...register("type")}
          options={typeOptions}
          error={errors.type?.message}
          placeholder="Оберіть тип"
          required
        />

        {isEdit && (
          <Select
            label="Статус"
            {...register("status")}
            options={statusOptions}
            error={errors.status?.message}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Дедлайн"
          type="datetime-local"
          {...register("deadline")}
          error={errors.deadline?.message}
          required
        />

        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              label="Ціна (грн)"
              type="number"
              step="0.01"
              {...field}
              value={field.value?.toString() ?? ""}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                field.onChange(isNaN(value) ? 0 : value);
              }}
              error={errors.price?.message}
              placeholder="0.00"
              required
            />
          )}
        />
      </div>

      {}
      <Controller
        name="clientId"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            label="Клієнт"
            options={clientOptions}
            value={field.value}
            onChange={(value) =>
              field.onChange(value ? Number(value) : undefined)
            }
            error={errors.clientId?.message}
            placeholder="Оберіть клієнта"
            required
          />
        )}
      />

      {}
      <Controller
        name="assignedEmployeeId"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            label="Призначити працівника"
            options={employeeOptions}
            value={field.value || ""}
            onChange={(value) => field.onChange(value ? Number(value) : null)}
            error={errors.assignedEmployeeId?.message}
            placeholder="Не призначено"
          />
        )}
      />

      <Textarea
        label="Опис"
        {...register("description")}
        error={errors.description?.message}
        placeholder="Додаткова інформація про замовлення..."
        rows={4}
      />

      {}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фото замовлення
        </label>

        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={
                photoPreview.startsWith("blob:") ||
                photoPreview.startsWith("data:")
                  ? photoPreview
                  : `${API_URL}${photoPreview}`
              }
              alt="Preview"
              className="w-full max-w-md h-48 object-contain rounded-lg border border-gray-300"
            />
            {(photoPreview.startsWith("blob:") ||
              photoPreview.startsWith("data:")) && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">
                    Натисніть для завантаження
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP (MAX. 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                {...register("photo")}
              />
            </label>
          </div>
        )}
        {errors.photo?.message && (
          <p className="mt-1 text-sm text-red-600">
            {errors.photo.message as string}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Скасувати
          </Button>
        )}
      </div>
    </form>
  );
};
