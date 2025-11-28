import { OrderStatus, OrderType } from "./common.types";

export interface Order {
  id: number;
  title: string;
  type: OrderType;
  deadline: string;
  photoUrl: string | null;
  price: number;
  description: string | null;
  status: OrderStatus;
  clientId: number;
  assignedEmployeeId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithRelations extends Order {
  client: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
  };
  assignedEmployee: {
    id: number;
    name: string;
    position: string;
    email: string;
  } | null;
}

export interface OrderFilterParams {
  search?: string;
  status?: OrderStatus;
  type?: OrderType;
  clientId?: number;
  employeeId?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  title: string;
  type: OrderType;
  deadline: string;
  price: number;
  description?: string;
  clientId: number;
  assignedEmployeeId?: number | null;
  photo?: File;
}

export interface UpdateOrderData {
  title?: string;
  type?: OrderType;
  deadline?: string;
  price?: number;
  description?: string;
  clientId?: number;
  assignedEmployeeId?: number | null;
  status?: OrderStatus;
  photo?: File;
}

export interface OrderStats {
  byStatus: {
    pending: number;
    inProgress: number;
    done: number;
  };
  byType: {
    sewing: number;
    repair: number;
  };
  totalRevenue: number;
  averagePrice: number;
  upcomingDeadlines: number;
}
