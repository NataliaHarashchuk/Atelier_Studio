import { Employee, UserRole } from "@prisma/client";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface CreateEmployeeDto {
  name: string;
  position: string;
  salary: number;
  phone: string;
  email: string;

  createAccount?: boolean;
  password?: string;
  role?: UserRole;
}

export interface UpdateEmployeeDto {
  name?: string;
  position?: string;
  salary?: number;
  phone?: string;
  email?: string;
}

export interface EmployeeResponse extends Employee {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  } | null;
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

export interface EmployeeFilterParams {
  search?: string;
  position?: string;
  hasAccount?: boolean;
  page?: number;
  limit?: number;
}

export interface EmployeeIdParams extends ParamsDictionary {
  id: string;
}

export interface EmployeesQueryParams {
  search?: string;
  position?: string;
  hasAccount?: string;
  page?: string;
  limit?: string;
}

export type CreateEmployeeRequest = Request<{}, {}, CreateEmployeeDto>;
export type GetEmployeesRequest = Request<{}, {}, {}, EmployeesQueryParams>;
export type GetEmployeeByIdRequest = Request<EmployeeIdParams>;
export type UpdateEmployeeRequest = Request<
  EmployeeIdParams,
  {},
  UpdateEmployeeDto
>;
export type DeleteEmployeeRequest = Request<EmployeeIdParams>;
