import { UserRole } from "@prisma/client";
import { Request } from "express";

export interface RegisterDto {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: UserRole;
  };
  accessToken: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export type RegisterRequest = Request<{}, {}, RegisterDto>;
export type LoginRequest = Request<{}, {}, LoginDto>;
