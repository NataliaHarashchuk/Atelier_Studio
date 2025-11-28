import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обов'язковий")
    .email("Неправильний формат email"),

  password: z.string().min(1, "Пароль обов'язковий"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Поточний пароль обов'язковий"),

    newPassword: z
      .string()
      .min(6, "Новий пароль повинен містити мінімум 6 символів")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Пароль повинен містити велику літеру, малу літеру та цифру",
      ),

    confirmPassword: z.string().min(1, "Підтвердження пароля обов'язкове"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
