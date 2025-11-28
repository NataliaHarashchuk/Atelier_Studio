import { prisma } from "../../server.js";
import { AppError } from "../../middlewares/errorHandler.js";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeResponse,
  EmployeeWithStats,
  EmployeeFilterParams,
} from "./employees.types.js";
import { PaginatedResponse } from "../../types/common.types.js";
import { hashPassword } from "../../utils/password.js";
import { Prisma, UserRole } from "@prisma/client";

export class EmployeesService {
  async createEmployee(data: CreateEmployeeDto): Promise<EmployeeResponse> {
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (existingEmployee) {
      throw new AppError("Employee with this email already exists", 409);
    }

    if (data.createAccount && data.password && data.role) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError("User with this email already exists", 409);
      }

      const hashedPassword = await hashPassword(data.password);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            role: data.role!,
          },
        });

        const employee = await tx.employee.create({
          data: {
            name: data.name,
            position: data.position,
            salary: new Prisma.Decimal(data.salary),
            phone: data.phone,
            email: data.email,
            userId: user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });

        return employee;
      });

      return result;
    } else {
      const employee = await prisma.employee.create({
        data: {
          name: data.name,
          position: data.position,
          salary: new Prisma.Decimal(data.salary),
          phone: data.phone,
          email: data.email,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return employee;
    }
  }

  async createAccountForEmployee(
    employeeId: number,
    password: string,
    role: UserRole,
  ): Promise<EmployeeResponse> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    if (employee.userId) {
      throw new AppError("Employee already has an account", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: employee.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: employee.email,
          password: hashedPassword,
          role: role,
        },
      });

      const updatedEmployee = await tx.employee.update({
        where: { id: employeeId },
        data: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updatedEmployee;
    });

    return result;
  }

  async getEmployees(
    params: EmployeeFilterParams,
  ): Promise<PaginatedResponse<EmployeeWithStats>> {
    const { search, position, hasAccount, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (position) {
      where.position = { contains: position, mode: "insensitive" };
    }

    if (hasAccount !== undefined) {
      if (hasAccount) {
        where.userId = { not: null };
      } else {
        where.userId = null;
      }
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: number): Promise<EmployeeWithStats> {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    return employee;
  }

  async getEmployeeWithOrders(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        orders: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    return employee;
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployeeDto,
  ): Promise<EmployeeResponse> {
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      throw new AppError("Employee not found", 404);
    }

    if (data.email) {
      const emailExists = await prisma.employee.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new AppError("Employee with this email already exists", 409);
      }

      if (existingEmployee.userId) {
        await prisma.user.update({
          where: { id: existingEmployee.userId },
          data: { email: data.email },
        });
      }
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.position && { position: data.position }),
        ...(data.salary !== undefined && {
          salary: new Prisma.Decimal(data.salary),
        }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<void> {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    if (employee._count.orders > 0) {
      throw new AppError(
        "Cannot delete employee with existing orders. Reassign orders first or contact administrator.",
        400,
      );
    }

    await prisma.$transaction(async (tx) => {
      if (employee.userId) {
        await tx.user.delete({
          where: { id: employee.userId },
        });
      }

      await tx.employee.delete({
        where: { id },
      });
    });
  }

  async getEmployeeStats(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            price: true,
            status: true,
          },
        },
      },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const totalOrders = employee.orders.length;
    const totalRevenue = employee.orders.reduce(
      (sum, order) => sum + Number(order.price),
      0,
    );
    const ordersByStatus = {
      pending: employee.orders.filter((o) => o.status === "PENDING").length,
      inProgress: employee.orders.filter((o) => o.status === "IN_PROGRESS")
        .length,
      done: employee.orders.filter((o) => o.status === "DONE").length,
    };

    return {
      id: employee.id,
      name: employee.name,
      position: employee.position,
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        ordersByStatus,
      },
    };
  }
}
