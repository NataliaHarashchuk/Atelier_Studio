import { z } from "zod";
import { UserRole } from "@/types/common.types";

export const employeeSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ім'я повинно містити мінімум 2 символи")
      .max(100, "Ім'я не повинно перевищувати 100 символів"),

    position: z
      .string()
      .min(2, "Посада повинна містити мінімум 2 символи")
      .max(100, "Посада не повинна перевищувати 100 символів"),

    salary: z.coerce
      .number({ invalid_type_error: "Зарплата повинна бути числом" })
      .positive("Зарплата повинна бути додатним числом")
      .min(0, "Зарплата обов'язкова")
      .finite("Зарплата повинна бути скінченним числом"),

    phone: z
      .string()
      .min(10, "Телефон повинен містити мінімум 10 символів")
      .max(20, "Телефон не повинен перевищувати 20 символів")
      .regex(/^[\d\s\+\-\(\)]+$/, "Неправильний формат телефону"),

    email: z
      .string()
      .email("Неправильний формат email")
      .max(100, "Email не повинен перевищувати 100 символів"),

    createAccount: z.boolean().optional(),

    password: z
      .string()
      .min(6, "Пароль повинен містити мінімум 6 символів")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Пароль повинен містити велику літеру, малу літеру та цифру",
      )
      .optional(),

    role: z
      .enum([UserRole.MASTER, UserRole.MANAGER], {
        errorMap: () => ({ message: "Оберіть роль: Майстер або Менеджер" }),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.createAccount) {
        return data.password !== undefined && data.role !== undefined;
      }
      return true;
    },
    {
      message: "Пароль та роль обов'язкові при створенні облікового запису",
      path: ["password"],
    },
  );

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const createAccountSchema = z.object({
  password: z
    .string()
    .min(6, "Пароль повинен містити мінімум 6 символів")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль повинен містити велику літеру, малу літеру та цифру",
    ),

  role: z.enum([UserRole.MASTER, UserRole.MANAGER], {
    errorMap: () => ({ message: "Оберіть роль: Майстер або Менеджер" }),
  }),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
