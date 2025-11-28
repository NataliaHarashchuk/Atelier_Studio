import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeSchema,
  EmployeeFormData,
} from "@/validations/employee.validation";
import { UserRole } from "@/types/common.types";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Checkbox } from "@/components/common/Checkbox";
import { Button } from "@/components/common/Button";

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  defaultValues?: Partial<EmployeeFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
  isEdit?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
  isEdit = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const createAccount = watch("createAccount");

  const roleOptions = [
    { value: UserRole.MASTER, label: "Майстер" },
    { value: UserRole.MANAGER, label: "Менеджер" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Ім'я працівника"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Введіть ім'я"
        required
      />

      <Input
        label="Посада"
        {...register("position")}
        error={errors.position?.message}
        placeholder="Швачка, кравець, майстер..."
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="salary"
          control={control}
          render={({ field }) => (
            <Input
              label="Зарплата (грн)"
              type="number"
              step="0.01"
              {...field}
              value={field.value?.toString() ?? ""}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                field.onChange(isNaN(value) ? 0 : value);
              }}
              error={errors.salary?.message}
              placeholder="0.00"
              required
            />
          )}
        />

        <Input
          label="Телефон"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="+380123456789"
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="employee@example.com"
        required
      />

      {!isEdit && (
        <>
          <hr />

          <div>
            <Checkbox
              label="Створити обліковий запис для доступу до системи"
              {...register("createAccount")}
              error={errors.createAccount?.message}
            />
          </div>

          {createAccount && (
            <div className="space-y-4 pl-6 border-l-2 border-primary-200">
              <Input
                label="Пароль"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder="••••••••"
                required={createAccount}
              />

              <Select
                label="Роль в системі"
                {...register("role")}
                options={roleOptions}
                error={errors.role?.message}
                placeholder="Оберіть роль"
                required={createAccount}
              />

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Права доступу:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Майстер:</strong> Перегляд своїх замовлень, зміна
                    статусу, перегляд складу
                  </li>
                  <li>
                    <strong>Менеджер:</strong> Повний доступ до замовлень,
                    клієнтів, працівників та складу
                  </li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

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
