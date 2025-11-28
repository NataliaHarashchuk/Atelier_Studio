import axiosInstance from "./axios";
import {
  MaterialResponse,
  MaterialFilterParams,
  CreateMaterialData,
  UpdateMaterialData,
  UpdateQuantityData,
  InventoryStats,
} from "@/types/material.types";
import {
  ApiPaginatedResponse,
  ApiResponse,
  PaginatedResponse,
} from "@/types/common.types";

export const materialsApi = {
  getMaterials: async (
    params?: MaterialFilterParams,
  ): Promise<PaginatedResponse<MaterialResponse>> => {
    const response = await axiosInstance.get<
      ApiPaginatedResponse<MaterialResponse>
    >("/materials", { params });

    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getMaterialById: async (id: number): Promise<MaterialResponse> => {
    const response = await axiosInstance.get<ApiResponse<MaterialResponse>>(
      `/materials/${id}`,
    );
    return response.data.data!;
  },

  createMaterial: async (
    data: CreateMaterialData,
  ): Promise<MaterialResponse> => {
    const response = await axiosInstance.post<ApiResponse<MaterialResponse>>(
      "/materials",
      data,
    );
    return response.data.data!;
  },

  updateMaterial: async (
    id: number,
    data: UpdateMaterialData,
  ): Promise<MaterialResponse> => {
    const response = await axiosInstance.patch<ApiResponse<MaterialResponse>>(
      `/materials/${id}`,
      data,
    );
    return response.data.data!;
  },

  updateMaterialQuantity: async (
    id: number,
    data: UpdateQuantityData,
  ): Promise<MaterialResponse> => {
    const response = await axiosInstance.patch<ApiResponse<MaterialResponse>>(
      `/materials/${id}/quantity`,
      data,
    );
    return response.data.data!;
  },

  deleteMaterial: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/materials/${id}`);
  },

  getInventoryStats: async (): Promise<InventoryStats> => {
    const response = await axiosInstance.get<ApiResponse<InventoryStats>>(
      "/materials/stats/inventory",
    );
    return response.data.data!;
  },

  getLowStockMaterials: async (): Promise<MaterialResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<MaterialResponse[]>>(
      "/materials/low-stock",
    );
    return response.data.data!;
  },
};
