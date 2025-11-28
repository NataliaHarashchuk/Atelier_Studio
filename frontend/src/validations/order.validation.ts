import { z } from "zod";
import { OrderType, OrderStatus } from "@/types/common.types";

export const orderSchema = z.object({
  title: z
    .string()
    .min(2, "Назва повинна містити мінімум 2 символи")
    .max(200, "Назва не повинна перевищувати 200 символів"),

  type: z.nativeEnum(OrderType, {
    errorMap: () => ({ message: "Оберіть тип замовлення" }),
  }),

  deadline: z
    .string()
    .min(1, "Дедлайн обов'язковий")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Неправильний формат дати",
    })
    .refine((val) => new Date(val) > new Date(), {
      message: "Дедлайн повинен бути в майбутньому",
    }),

  price: z.coerce
    .number({
      required_error: "Ціна обов'язкова",
      invalid_type_error: "Ціна повинна бути числом",
    })
    .positive("Ціна повинна бути додатною")
    .finite("Ціна повинна бути скінченним числом"),

  description: z
    .string()
    .max(2000, "Опис не повинен перевищувати 2000 символів")
    .optional(),

  clientId: z
    .number({
      required_error: "Оберіть клієнта",
      invalid_type_error: "ID клієнта повинно бути числом",
    })
    .int("ID клієнта повинно бути цілим числом")
    .positive("ID клієнта повинно бути додатним"),

  assignedEmployeeId: z
    .number({
      invalid_type_error: "ID працівника повинно бути числом",
    })
    .int("ID працівника повинно бути цілим числом")
    .positive("ID працівника повинно бути додатним")
    .optional()
    .nullable(),

  status: z.nativeEnum(OrderStatus).optional(),

  photo: z.any().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: "Оберіть статус" }),
  }),
});

export type UpdateOrderStatusFormData = z.infer<typeof updateOrderStatusSchema>;
