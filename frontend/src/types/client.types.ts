export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithStats extends Client {
  _count: {
    orders: number;
  };
}

export interface ClientWithOrders extends ClientWithStats {
  orders: Array<{
    id: number;
    title: string;
    type: string;
    status: string;
    price: number;
    deadline: string;
    assignedEmployee: {
      id: number;
      name: string;
      position: string;
    } | null;
  }>;
}

export interface ClientStats {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  stats: {
    totalOrders: number;
    totalSpent: number;
    ordersByStatus: {
      pending: number;
      inProgress: number;
      done: number;
    };
  };
}

export interface ClientFilterParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
}
