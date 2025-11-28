import { z } from "zod";

export const MATERIAL_UNITS = [
  "м",
  "шт",
  "кг",
  "л",
  "м²",
  "м³",
  "пог.м",
  "компл",
] as const;

export const materialSchema = z.object({
  name: z
    .string()
    .min(2, "Назва повинна містити мінімум 2 символи")
    .max(100, "Назва не повинна перевищувати 100 символів"),

  quantity: z.coerce
    .number({
      required_error: "Кількість обов'язкова",
      invalid_type_error: "Кількість повинна бути числом",
    })
    .nonnegative("Кількість не може бути від'ємною")
    .finite("Кількість повинна бути скінченним числом"),

  unit: z.enum(MATERIAL_UNITS, {
    errorMap: () => ({ message: "Оберіть одиницю виміру" }),
  }),

  pricePerUnit: z.coerce
    .number({
      required_error: "Ціна за одиницю обов'язкова",
      invalid_type_error: "Ціна повинна бути числом",
    })
    .positive("Ціна повинна бути додатною")
    .finite("Ціна повинна бути скінченним числом"),
});

export type MaterialFormData = z.infer<typeof materialSchema>;

export const updateQuantitySchema = z.object({
  quantity: z.coerce
    .number({
      required_error: "Кількість обов'язкова",
      invalid_type_error: "Кількість повинна бути числом",
    })
    .positive("Кількість повинна бути додатною")
    .finite("Кількість повинна бути скінченним числом"),

  operation: z.enum(["add", "subtract", "set"], {
    errorMap: () => ({ message: "Оберіть операцію" }),
  }),
});

export type UpdateQuantityFormData = z.infer<typeof updateQuantitySchema>;
