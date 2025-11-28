import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/validations/auth.validation";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(data);

      setAuth(response.user, response.accessToken);

      toast.success("Успішний вхід!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-script text-gray-900 capitalize">
            atelier studio
          </h1>
          <p className="text-gray-600 mt-2">
            Увійдіть до свого облікового запису
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Пароль"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Вхід..." : "Увійти"}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Немає облікового запису?</p>
          <p className="mt-1">Зверніться до адміністратора</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
