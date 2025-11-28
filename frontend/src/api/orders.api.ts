import axiosInstance from "./axios";
import {
  Order,
  OrderWithRelations,
  OrderFilterParams,
  CreateOrderData,
  UpdateOrderData,
  OrderStats,
} from "@/types/order.types";
import { ApiPaginatedResponse, OrderStatus } from "@/types/common.types";
import { ApiResponse, PaginatedResponse } from "@/types/common.types";

export const ordersApi = {
  getOrders: async (
    params?: OrderFilterParams,
  ): Promise<PaginatedResponse<OrderWithRelations>> => {
    const response = await axiosInstance.get<
      ApiPaginatedResponse<OrderWithRelations>
    >("/orders", { params });

    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getOrderById: async (id: number): Promise<OrderWithRelations> => {
    const response = await axiosInstance.get<ApiResponse<OrderWithRelations>>(
      `/orders/${id}`,
    );
    return response.data.data!;
  },

  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("deadline", data.deadline);
    formData.append("price", data.price.toString());
    formData.append("clientId", data.clientId.toString());

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.assignedEmployeeId) {
      formData.append("assignedEmployeeId", data.assignedEmployeeId.toString());
    }

    if (data.photo) {
      formData.append("photo", data.photo);
    }

    const response = await axiosInstance.post<ApiResponse<Order>>(
      "/orders",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data!;
  },

  updateOrder: async (id: number, data: UpdateOrderData): Promise<Order> => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.type) formData.append("type", data.type);
    if (data.deadline) formData.append("deadline", data.deadline);
    if (data.price !== undefined)
      formData.append("price", data.price.toString());
    if (data.description !== undefined)
      formData.append("description", data.description);
    if (data.clientId) formData.append("clientId", data.clientId.toString());
    if (data.assignedEmployeeId !== undefined) {
      formData.append(
        "assignedEmployeeId",
        data.assignedEmployeeId?.toString() || "",
      );
    }
    if (data.status) formData.append("status", data.status);
    if (data.photo) formData.append("photo", data.photo);

    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/orders/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data!;
  },

  updateOrderStatus: async (
    id: number,
    status: OrderStatus,
  ): Promise<Order> => {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status },
    );
    return response.data.data!;
  },

  assignEmployee: async (id: number, employeeId: number): Promise<Order> => {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/orders/${id}/assign`,
      { employeeId },
    );
    return response.data.data!;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}`);
  },

  getOrderStats: async (): Promise<OrderStats> => {
    const response = await axiosInstance.get<ApiResponse<OrderStats>>(
      "/orders/stats/overview",
    );
    return response.data.data!;
  },

  getUpcomingDeadlines: async (): Promise<OrderWithRelations[]> => {
    const response = await axiosInstance.get<ApiResponse<OrderWithRelations[]>>(
      "/orders/upcoming-deadlines",
    );
    return response.data.data!;
  },

  getOverdueOrders: async (): Promise<OrderWithRelations[]> => {
    const response =
      await axiosInstance.get<ApiResponse<OrderWithRelations[]>>(
        "/orders/overdue",
      );
    return response.data.data!;
  },
};
