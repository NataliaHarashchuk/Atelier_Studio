import { Order, OrderStatus, OrderType } from "@prisma/client";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface CreateOrderDto {
  title: string;
  type: OrderType;
  deadline: string | Date;
  price: number;
  description?: string;
  clientId: number;
  assignedEmployeeId?: number;
  photo?: Express.Multer.File;
}

export interface UpdateOrderDto {
  title?: string;
  type?: OrderType;
  deadline?: string | Date;
  price?: number;
  description?: string;
  status?: OrderStatus;
  clientId?: number;
  assignedEmployeeId?: number;
  photo?: Express.Multer.File;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OrderResponse extends Order {
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
  } | null;
}

export interface OrderFilterParams {
  search?: string;
  status?: OrderStatus;
  type?: OrderType;
  clientId?: number;
  assignedEmployeeId?: number;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface OrdersStats {
  total: number;
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

export interface OrderIdParams extends ParamsDictionary {
  id: string;
}

export interface OrdersQueryParams {
  search?: string;
  status?: string;
  type?: string;
  clientId?: string;
  assignedEmployeeId?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

export type CreateOrderRequest = Request<{}, {}, CreateOrderDto>;
export type GetOrdersRequest = Request<{}, {}, {}, OrdersQueryParams>;
export type GetOrderByIdRequest = Request<OrderIdParams>;
export type UpdateOrderRequest = Request<OrderIdParams, {}, UpdateOrderDto>;
export type UpdateOrderStatusRequest = Request<
  OrderIdParams,
  {},
  UpdateOrderStatusDto
>;
export type DeleteOrderRequest = Request<OrderIdParams>;
