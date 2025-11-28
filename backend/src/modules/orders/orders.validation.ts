import { z } from "zod";
import { OrderStatus, OrderType } from "@prisma/client";

export const createOrderSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must not exceed 200 characters")
      .trim(),

    type: z.nativeEnum(OrderType, {
      errorMap: () => ({ message: "Invalid order type" }),
    }),

    deadline: z
      .string({ required_error: "Deadline is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .refine((val) => new Date(val) > new Date(), {
        message: "Deadline must be in the future",
      }),

    price: z.coerce
      .number({ required_error: "Price is required" })
      .positive("Price must be positive")
      .finite(),

    description: z.string().max(2000).trim().optional().nullable(),

    clientId: z.coerce
      .number({ required_error: "Client ID is required" })
      .int()
      .positive(),

    assignedEmployeeId: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),

    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export const updateOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title must not exceed 200 characters")
        .trim()
        .optional(),

      type: z
        .nativeEnum(OrderType, {
          errorMap: () => ({ message: "Invalid order type" }),
        })
        .optional(),

      deadline: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        })
        .optional(),

      price: z.coerce
        .number({
          invalid_type_error: "Price must be a number",
        })
        .positive("Price must be positive")
        .finite("Price must be a finite number")
        .optional(),

      description: z
        .string()
        .max(2000, "Description must not exceed 2000 characters")
        .trim()
        .optional(),

      status: z
        .nativeEnum(OrderStatus, {
          errorMap: () => ({ message: "Invalid order status" }),
        })
        .optional(),

      clientId: z.coerce
        .number({
          invalid_type_error: "Client ID має бути числом",
        })
        .int("Client ID must be an integer")
        .positive("Client ID must be positive")
        .optional(),

      assignedEmployeeId: z.coerce
        .number({
          invalid_type_error: "Assigned employee ID має бути числом",
        })
        .int("Assigned employee ID must be an integer")
        .positive("Assigned employee ID must be positive")
        .nullable()
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, {
      errorMap: () => ({ message: "Invalid order status" }),
    }),
  }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const deleteOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID має бути числом"),
  }),
});

export const getOrdersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    clientId: z.string().regex(/^\d+$/).optional(),
    assignedEmployeeId: z.string().regex(/^\d+$/).optional(),
    deadlineFrom: z.string().optional(),
    deadlineTo: z.string().optional(),
    minPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    maxPrice: z
      .string()
      .regex(/^\d+(\.\d+)?$/)
      .optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
