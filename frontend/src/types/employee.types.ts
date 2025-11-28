import { UserRole } from "./common.types";

export interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  phone: string;
  email: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeWithStats extends Employee {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  } | null;
  _count: {
    orders: number;
  };
}

export interface EmployeeWithOrders extends EmployeeWithStats {
  orders: Array<{
    id: number;
    title: string;
    type: string;
    status: string;
    price: number;
    deadline: string;
    client: {
      id: number;
      name: string;
      phone: string;
    };
  }>;
}

export interface EmployeeStats {
  id: number;
  name: string;
  position: string;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: {
      pending: number;
      inProgress: number;
      done: number;
    };
  };
}

export interface EmployeeFilterParams {
  search?: string;
  position?: string;
  hasAccount?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateEmployeeData {
  name: string;
  position: string;
  salary: number;
  phone: string;
  email: string;
  createAccount?: boolean;
  password?: string;
  role?: UserRole;
}

export interface UpdateEmployeeData {
  name?: string;
  position?: string;
  salary?: number;
  phone?: string;
  email?: string;
}

export interface CreateAccountData {
  password: string;
  role: UserRole;
}
