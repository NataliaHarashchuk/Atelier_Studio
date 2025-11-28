import { z } from "zod";

export const createClientSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Ім'я обов'язкове",
      })
      .min(2, "Ім'я має бути не менше 2 символів")
      .max(100, "Ім'я не повинно перевищувати 100 символів")
      .trim(),

    email: z
      .string()
      .email("Неправильний формат пошти")
      .max(100, "Електронна пошта не повинна перевищувати 100 символів")
      .optional()
      .or(z.literal("")),

    phone: z
      .string({
        required_error: "Phone is required",
      })
      .min(10, "Телефон повинен бути не менше 10 символів")
      .max(20, "Телефон не повинен перевищувати 20 символів")
      .regex(/^[\d\s\+\-\(\)]+$/, "Некоректний формат телефону")
      .trim(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом").transform(Number),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, "Ім'я повинно містити мінімум 2 символи")
        .max(100, "Ім'я не повинно перевищувати 100 символів")
        .trim()
        .optional(),

      email: z
        .string()
        .email("Неправильний формат email")
        .max(100, "Email не повинен перевищувати 100 символів")
        .optional()
        .or(z.literal("")),

      phone: z
        .string()
        .min(10, "Телефон повинен містити мінімум 10 символів")
        .max(20, "Телефон не повинен перевищувати 20 символів")
        .regex(/^[\d\s\+\-\(\)]+$/, "Неправильний формат телефону")
        .trim()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Для оновлення необхідно надати принаймні одне поле",
    }),
});

/**
 * Схема валідації для отримання клієнта по ID
 */
export const getClientByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом").transform(Number),
  }),
});

/**
 * Схема валідації для видалення клієнта
 */
export const deleteClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом").transform(Number),
  }),
});

/**
 * Схема валідації для фільтрації/пошуку клієнтів
 */
export const getClientsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((val) => val > 0, "Page must be greater than 0")
      .optional()
      .default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  }),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type GetClientByIdInput = z.infer<typeof getClientByIdSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type GetClientsInput = z.infer<typeof getClientsSchema>;
