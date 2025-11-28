import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        toast.error(data.message || "Сесія закінчилася. Увійдіть знову.");
      } else if (status === 403) {
        if (data.message?.includes("Гостьовий доступ")) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
        toast.error(data.message || "Немає прав доступу до цього ресурсу");
      } else if (status === 404) {
        toast.error(data.message || "Ресурс не знайдено");
      } else if (status === 409) {
        toast.error(data.message || "Конфлікт даних");
      } else if (status >= 500) {
        toast.error("Помилка сервера. Спробуйте пізніше.");
      } else {
        toast.error(data.message || "Щось пішло не так");
      }
    } else if (error.request) {
      toast.error("Не вдалося з'єднатися з сервером");
    } else {
      toast.error("Виникла помилка: " + error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
