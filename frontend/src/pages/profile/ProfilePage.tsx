import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/validations/auth.validation";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import toast from "react-hot-toast";
import { User, Lock } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      toast.success("Пароль успішно змінено!");
      reset();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      ADMIN: "Адміністратор",
      MANAGER: "Менеджер",
      MASTER: "Майстер",
      GUEST: "Гість",
    };
    return roleNames[role] || role;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Налаштування профілю
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Інформація про користувача
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Роль
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {user && getRoleName(user.role)}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Зміна пароля
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Поточний пароль"
                type="password"
                {...register("oldPassword")}
                error={errors.oldPassword?.message}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <Input
                label="Новий пароль"
                type="password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <Input
                label="Підтвердження пароля"
                type="password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Збереження..." : "Змінити пароль"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
