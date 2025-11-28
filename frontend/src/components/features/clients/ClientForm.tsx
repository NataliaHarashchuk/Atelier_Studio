import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, ClientFormData } from "@/validations/client.validation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  defaultValues?: Partial<ClientFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Ім'я клієнта"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Введіть ім'я"
        required
      />

      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="client@example.com"
      />

      <Input
        label="Телефон"
        {...register("phone")}
        error={errors.phone?.message}
        placeholder="+380123456789"
        required
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
