import axiosInstance from "./axios";
import {
  Client,
  ClientWithStats,
  ClientWithOrders,
  ClientStats,
  ClientFilterParams,
  CreateClientData,
  UpdateClientData,
} from "@/types/client.types";
import {
  ApiResponse,
  PaginatedResponse,
  ApiPaginatedResponse,
} from "@/types/common.types";

export const clientsApi = {
  getClients: async (
    params?: ClientFilterParams,
  ): Promise<PaginatedResponse<ClientWithStats>> => {
    const response = await axiosInstance.get<
      ApiPaginatedResponse<ClientWithStats>
    >("/clients", { params });

    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getClientById: async (id: number): Promise<ClientWithStats> => {
    const response = await axiosInstance.get<ApiResponse<ClientWithStats>>(
      `/clients/${id}`,
    );

    return response.data.data!;
  },

  getClientWithOrders: async (id: number): Promise<ClientWithOrders> => {
    const response = await axiosInstance.get<ApiResponse<ClientWithOrders>>(
      `/clients/${id}/details`,
    );
    return response.data.data!;
  },

  getClientStats: async (id: number): Promise<ClientStats> => {
    const response = await axiosInstance.get<ApiResponse<ClientStats>>(
      `/clients/${id}/stats`,
    );
    return response.data.data!;
  },

  createClient: async (data: CreateClientData): Promise<Client> => {
    const response = await axiosInstance.post<ApiResponse<Client>>(
      "/clients",
      data,
    );
    return response.data.data!;
  },

  updateClient: async (id: number, data: UpdateClientData): Promise<Client> => {
    const response = await axiosInstance.patch<ApiResponse<Client>>(
      `/clients/${id}`,
      data,
    );
    return response.data.data!;
  },

  deleteClient: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/clients/${id}`);
  },
};
