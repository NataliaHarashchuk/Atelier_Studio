import { z } from "zod";

export const createMaterialSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Ім'я має бути не менше 2 символів")
      .max(100, "Ім'я не повинно перевищувати 100 символів")
      .trim(),

    quantity: z
      .number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a number",
      })
      .nonnegative("Quantity must be non-negative")
      .finite("Quantity must be a finite number"),

    unit: z
      .string({
        required_error: "Unit is required",
      })
      .min(1, "Unit is required")
      .max(20, "Unit must not exceed 20 characters")
      .trim()
      .refine(
        (val) =>
          ["м", "шт", "кг", "л", "м²", "м³", "пог.м", "компл"].includes(val),
        {
          message: "Invalid unit. Allowed: м, шт, кг, л, м², м³, пог.м, компл",
        },
      ),

    pricePerUnit: z
      .number({
        required_error: "Price per unit is required",
        invalid_type_error: "Price per unit must be a number",
      })
      .positive("Price per unit must be positive")
      .finite("Price per unit must be a finite number"),
  }),
});

export const updateMaterialSchema = z.object({
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

      quantity: z
        .number({
          invalid_type_error: "Quantity must be a number",
        })
        .nonnegative("Quantity must be non-negative")
        .finite("Quantity must be a finite number")
        .optional(),

      unit: z
        .string()
        .min(1, "Unit is required")
        .max(20, "Unit must not exceed 20 characters")
        .trim()
        .refine(
          (val) =>
            ["м", "шт", "кг", "л", "м²", "м³", "пог.м", "компл"].includes(val),
          {
            message:
              "Invalid unit. Allowed: м, шт, кг, л, м², м³, пог.м, компл",
          },
        )
        .optional(),

      pricePerUnit: z
        .number({
          invalid_type_error: "Price per unit must be a number",
        })
        .positive("Price per unit must be positive")
        .finite("Price per unit must be a finite number")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const updateMaterialQuantitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z.object({
    quantity: z
      .number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a number",
      })
      .positive("Quantity must be positive")
      .finite("Quantity must be a finite number"),

    operation: z.enum(["add", "subtract", "set"], {
      errorMap: () => ({
        message: "Operation must be one of: add, subtract, set",
      }),
    }),
  }),
});

export const getMaterialByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const deleteMaterialSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const getMaterialsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    unit: z.string().optional(),
    minQuantity: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    maxQuantity: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    lowStock: z
      .string()
      .regex(/^(true|false)$/)
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
