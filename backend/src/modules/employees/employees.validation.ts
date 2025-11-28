import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createEmployeeSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required",
        })
        .min(2, "Ім'я має бути не менше 2 символів")
        .max(100, "Ім'я не повинно перевищувати 100 символів")
        .trim(),

      position: z
        .string({
          required_error: "Position is required",
        })
        .min(2, "Position must be at least 2 characters")
        .max(100, "Position must not exceed 100 characters")
        .trim(),

      salary: z
        .number({
          required_error: "Salary is required",
          invalid_type_error: "Salary must be a number",
        })
        .positive("Salary must be positive")
        .finite("Salary must be a finite number"),

      phone: z
        .string({
          required_error: "Phone is required",
        })
        .min(10, "Телефон повинен бути не менше 10 символів")
        .max(20, "Телефон не повинен перевищувати 20 символів")
        .regex(/^[\d\s\+\-\(\)]+$/, "Некоректний формат телефону")
        .trim(),

      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Неправильний формат пошти")
        .max(100, "Електронна пошта не повинна перевищувати 100 символів")
        .trim()
        .toLowerCase(),

      createAccount: z.boolean().optional(),

      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password must not exceed 50 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        )
        .optional(),

      role: z
        .enum([UserRole.MASTER, UserRole.MANAGER], {
          errorMap: () => ({ message: "Role must be MASTER or MANAGER" }),
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
        message: "Password and role are required when creating an account",
        path: ["password"],
      },
    ),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, "Ім'я має бути не менше 2 символів")
        .max(100, "Ім'я не повинно перевищувати 100 символів")
        .trim()
        .optional(),

      position: z
        .string()
        .min(2, "Position must be at least 2 characters")
        .max(100, "Position must not exceed 100 characters")
        .trim()
        .optional(),

      salary: z
        .number({
          invalid_type_error: "Salary must be a number",
        })
        .positive("Salary must be positive")
        .finite("Salary must be a finite number")
        .optional(),

      phone: z
        .string()
        .min(10, "Телефон повинен бути не менше 10 символів")
        .max(20, "Телефон не повинен перевищувати 20 символів")
        .regex(/^[\d\s\+\-\(\)]+$/, "Некоректний формат телефону")
        .trim()
        .optional(),

      email: z
        .string()
        .email("Неправильний формат пошти")
        .max(100, "Електронна пошта не повинна перевищувати 100 символів")
        .trim()
        .toLowerCase()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getEmployeeByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const deleteEmployeeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const getEmployeesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    position: z.string().optional(),
    hasAccount: z
      .string()
      .regex(/^(true|false)$/)
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const createAccountForEmployeeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z.object({
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),

    role: z.enum([UserRole.MASTER, UserRole.MANAGER], {
      errorMap: () => ({ message: "Role must be MASTER or MANAGER" }),
    }),
  }),
});
