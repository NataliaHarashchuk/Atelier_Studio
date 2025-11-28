import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  materialSchema,
  MaterialFormData,
  MATERIAL_UNITS,
} from "@/validations/material.validation";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";

interface MaterialFormProps {
  onSubmit: (data: MaterialFormData) => void;
  defaultValues?: Partial<MaterialFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues,
  });

  const unitOptions = MATERIAL_UNITS.map((unit) => ({
    value: unit,
    label: unit,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Назва матеріалу"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Тканина, нитки, ґудзики..."
        required
      />

      <div className="grid grid-cols-2 gap-4">
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

        <Select
          label="Одиниця виміру"
          {...register("unit")}
          options={unitOptions}
          error={errors.unit?.message}
          placeholder="Оберіть одиницю"
          required
        />
      </div>

      <Controller
        name="pricePerUnit"
        control={control}
        render={({ field }) => (
          <Input
            label="Ціна за одиницю (грн)"
            type="number"
            step="0.01"
            {...field}
            value={field.value?.toString() ?? ""}
            onChange={(e) => {
              const value = e.target.valueAsNumber;
              field.onChange(isNaN(value) ? 0 : value);
            }}
            error={errors.pricePerUnit?.message}
            placeholder="0.00"
            required
          />
        )}
      />

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
