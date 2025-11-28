import { Client } from "@prisma/client";

export interface CreateClientDto {
  name: string;
  email?: string;
  phone: string;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ClientResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithStats extends Client {
  _count: {
    orders: number;
  };
}

export interface ClientFilterParams {
  search?: string;
  page?: number;
  limit?: number;
}
