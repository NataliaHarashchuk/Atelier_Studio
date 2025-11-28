import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateQuantitySchema,
  UpdateQuantityFormData,
} from "@/validations/material.validation";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";

interface UpdateQuantityFormProps {
  onSubmit: (data: UpdateQuantityFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  currentQuantity: number;
  unit: string;
}

export const UpdateQuantityForm: React.FC<UpdateQuantityFormProps> = ({
  onSubmit,
  isLoading,
  onCancel,
  currentQuantity,
  unit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UpdateQuantityFormData>({
    resolver: zodResolver(updateQuantitySchema),
    defaultValues: {
      operation: "add",
      quantity: 0,
    },
  });

  const operation = watch("operation");
  const quantity = watch("quantity") || 0;

  const operationOptions = [
    { value: "add", label: "Додати" },
    { value: "subtract", label: "Відняти" },
    { value: "set", label: "Встановити" },
  ];

  const getNewQuantity = () => {
    const start = Number(currentQuantity) || 0;
    const change = Number(quantity) || 0;

    switch (operation) {
      case "add":
        return start + change;
      case "subtract":
        return Math.max(0, start - change);
      case "set":
        return change;
      default:
        return start;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          Поточна кількість:{" "}
          <span className="font-semibold">
            {currentQuantity} {unit}
          </span>
        </p>
      </div>

      <Select
        label="Операція"
        {...register("operation")}
        options={operationOptions}
        error={errors.operation?.message}
        required
      />

      <Controller
        name="quantity"
        control={control}
        render={({ field }) => (
          <Input
            label="Кількість"
            type="number"
            step="0.01"
            {...field}
            value={field.value?.toString() ?? ""}
            onChange={(e) => {
              const value = e.target.valueAsNumber;
              field.onChange(isNaN(value) ? 0 : value);
            }}
            error={errors.quantity?.message}
            placeholder="0"
            required
          />
        )}
      />

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          Нова кількість:{" "}
          <span className="font-semibold">
            {getNewQuantity()} {unit}
          </span>
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Збереження..." : "Оновити"}
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
