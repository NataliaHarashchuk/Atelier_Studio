import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccountSchema,
  CreateAccountFormData,
} from "@/validations/employee.validation";
import { UserRole } from "@/types/common.types";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";

interface CreateAccountFormProps {
  onSubmit: (data: CreateAccountFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const roleOptions = [
    { value: UserRole.MASTER, label: "Майстер" },
    { value: UserRole.MANAGER, label: "Менеджер" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Пароль"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        required
      />

      <Select
        label="Роль в системі"
        {...register("role")}
        options={roleOptions}
        error={errors.role?.message}
        placeholder="Оберіть роль"
        required
      />

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Права доступу:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Майстер:</strong> Перегляд своїх замовлень, зміна статусу,
            перегляд складу
          </li>
          <li>
            <strong>Менеджер:</strong> Повний доступ до замовлень, клієнтів,
            працівників та складу
          </li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Створення..." : "Створити обліковий запис"}
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
