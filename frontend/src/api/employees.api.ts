import axiosInstance from "./axios";
import {
  Employee,
  EmployeeWithStats,
  EmployeeWithOrders,
  EmployeeStats,
  EmployeeFilterParams,
  CreateEmployeeData,
  UpdateEmployeeData,
  CreateAccountData,
} from "@/types/employee.types";
import {
  ApiResponse,
  PaginatedResponse,
  ApiPaginatedResponse,
} from "@/types/common.types";

export const employeesApi = {
  getEmployees: async (
    params?: EmployeeFilterParams,
  ): Promise<PaginatedResponse<EmployeeWithStats>> => {
    const response = await axiosInstance.get<
      ApiPaginatedResponse<EmployeeWithStats>
    >("/employees", { params });

    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getEmployeeById: async (id: number): Promise<EmployeeWithStats> => {
    const response = await axiosInstance.get<ApiResponse<EmployeeWithStats>>(
      `/employees/${id}`,
    );
    return response.data.data!;
  },

  getEmployeeWithOrders: async (id: number): Promise<EmployeeWithOrders> => {
    const response = await axiosInstance.get<ApiResponse<EmployeeWithOrders>>(
      `/employees/${id}/orders`,
    );
    return response.data.data!;
  },

  getEmployeeStats: async (id: number): Promise<EmployeeStats> => {
    const response = await axiosInstance.get<ApiResponse<EmployeeStats>>(
      `/employees/${id}/stats`,
    );
    return response.data.data!;
  },

  createEmployee: async (data: CreateEmployeeData): Promise<Employee> => {
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      "/employees",
      data,
    );
    return response.data.data!;
  },

  createAccountForEmployee: async (
    id: number,
    data: CreateAccountData,
  ): Promise<Employee> => {
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      `/employees/${id}/account`,
      data,
    );
    return response.data.data!;
  },

  updateEmployee: async (
    id: number,
    data: UpdateEmployeeData,
  ): Promise<Employee> => {
    const response = await axiosInstance.patch<ApiResponse<Employee>>(
      `/employees/${id}`,
      data,
    );
    return response.data.data!;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/employees/${id}`);
  },
};
