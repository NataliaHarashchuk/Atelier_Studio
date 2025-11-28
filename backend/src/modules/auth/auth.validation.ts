import { z } from "zod";
import { UserRole } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Неправильний формат пошти")
      .max(100, "Електронна пошта не повинна перевищувати 100 символів")
      .trim()
      .toLowerCase(),

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

    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: "Invalid role" }),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Неправильний формат пошти")
      .trim()
      .toLowerCase(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string({
          required_error: "Current password is required",
        })
        .min(1, "Current password is required"),

      newPassword: z
        .string({
          required_error: "New password is required",
        })
        .min(6, "New password must be at least 6 characters")
        .max(50, "New password must not exceed 50 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "New password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z.object({
    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: "Invalid role" }),
    }),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});
