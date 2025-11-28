import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я повинно містити мінімум 2 символи")
    .max(100, "Ім'я не повинно перевищувати 100 символів"),

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
    .regex(/^[\d\s\+\-\(\)]+$/, "Неправильний формат телефону"),
});

export type ClientFormData = z.infer<typeof clientSchema>;
