import { prisma } from "../../server.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { PaginatedResponse } from "../../types/common.types.js";
import { UserRole } from "@prisma/client";

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
}

export class UsersService {
  async getAllUsers(params: GetUsersParams): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10, role } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role as UserRole;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          employee: {
            select: {
              id: true,
              name: true,
              position: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            name: true,
            position: true,
            salary: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }
}
