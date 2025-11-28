import axiosInstance from "./axios";
import { AuthResponse, LoginCredentials, User } from "@/types/auth.types";
import { ApiResponse } from "@/types/common.types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>("/auth/me");
    return response.data.data!;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await axiosInstance.patch("/auth/change-password", data);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },
};
