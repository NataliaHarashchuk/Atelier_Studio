import { prisma } from "../../server.js";
import { AppError } from "../../middlewares/errorHandler.js";
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  OrderResponse,
  OrderFilterParams,
} from "./orders.types.js";
import { PaginatedResponse } from "../../types/common.types.js";
import { Prisma, OrderStatus, OrderType } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

export class OrdersService {

  private readonly orderInclude = {
    client: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    },
    assignedEmployee: {
      select: {
        id: true,
        name: true,
        position: true,
      },
    },
  };

  private async validateEntities(clientId?: number, employeeId?: number | null) {
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        throw new AppError("Client not found", 404);
      }
    }

    if (employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (!employee) {
        throw new AppError("Assigned employee not found", 404);
      }
    }
  }

  async createOrder(
    data: CreateOrderDto,
    photoPath?: string,
  ): Promise<OrderResponse> {
    await this.validateEntities(data.clientId, data.assignedEmployeeId);

    const order = await prisma.order.create({
      data: {
        title: data.title,
        type: data.type,
        deadline: new Date(data.deadline),
        price: new Prisma.Decimal(data.price),
        description: data.description,
        photoUrl: photoPath || null,
        clientId: data.clientId,
        assignedEmployeeId: data.assignedEmployeeId,
        status: OrderStatus.PENDING,
      },
      include: this.orderInclude,
    });

    return order;
  }

  async getOrders(
    params: OrderFilterParams,
  ): Promise<PaginatedResponse<OrderResponse>> {
    const {
      search,
      status,
      type,
      clientId,
      assignedEmployeeId,
      deadlineFrom,
      deadlineTo,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (assignedEmployeeId) {
      where.assignedEmployeeId = assignedEmployeeId;
    }

    if (deadlineFrom || deadlineTo) {
      where.deadline = {};
      if (deadlineFrom) {
        where.deadline.gte = deadlineFrom;
      }
      if (deadlineTo) {
        where.deadline.lte = deadlineTo;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          assignedEmployee: {
            select: {
              id: true,
              name: true,
              position: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: number): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  }

  async updateOrder(
    id: number,
    data: UpdateOrderDto,
    photoPath?: string,
  ): Promise<OrderResponse> {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new AppError("Order not found", 404);
    }

    await this.validateEntities(data.clientId, data.assignedEmployeeId);

    if (photoPath && existingOrder.photoUrl) {
      try {
        const oldPhotoPath = path.join(process.cwd(), existingOrder.photoUrl);
        await fs.unlink(oldPhotoPath);
      } catch (error) {
        console.error("Failed to delete old photo:", error);
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.deadline && { deadline: new Date(data.deadline) }),
        ...(data.price !== undefined && {
          price: new Prisma.Decimal(data.price),
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.status && { status: data.status }),
        ...(data.clientId && { clientId: data.clientId }),
        ...(data.assignedEmployeeId !== undefined && {
          assignedEmployeeId: data.assignedEmployeeId,
        }),
        ...(photoPath && { photoUrl: photoPath }),
      },
      include: this.orderInclude,
    });

    return updatedOrder;
  }


  async updateOrderStatus(
    id: number,
    data: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  async assignEmployee(
    orderId: number,
    employeeId: number,
  ): Promise<OrderResponse> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { assignedEmployeeId: employeeId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    return updatedOrder;
  }


  async deleteOrder(id: number): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.photoUrl) {
      try {
        const photoPath = path.join(process.cwd(), order.photoUrl);
        await fs.unlink(photoPath);

      } catch (error) {
        console.error("Failed to delete photo:", error);
      }
    }

    await prisma.order.delete({
      where: { id },
    });
  }

  async getOrderStats(user: any) {
    let where: any = {};

    if (user.role === "MASTER") {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
      });

      if (employee) {
        where.assignedEmployeeId = employee.id;
      } else {
        return {
          byStatus: {
            pending: 0,
            inProgress: 0,
            done: 0,
          },
          byType: {
            sewing: 0,
            repair: 0,
          },
          totalRevenue: 0,
          averagePrice: 0,
          upcomingDeadlines: 0,
        };
      }
    }

    const [pending, inProgress, done] = await Promise.all([
      prisma.order.count({
        where: { ...where, status: OrderStatus.PENDING },
      }),
      prisma.order.count({
        where: { ...where, status: OrderStatus.IN_PROGRESS },
      }),
      prisma.order.count({
        where: { ...where, status: OrderStatus.DONE },
      }),
    ]);

    const [sewing, repair] = await Promise.all([
      prisma.order.count({
        where: { ...where, type: OrderType.SEWING },
      }),
      prisma.order.count({
        where: { ...where, type: OrderType.REPAIR },
      }),
    ]);

    const totalRevenueResult = await prisma.order.aggregate({
      where,
      _sum: {
        price: true,
      },
    });

    const totalRevenue = totalRevenueResult._sum.price || 0;

    const averagePriceResult = await prisma.order.aggregate({
      where,
      _avg: {
        price: true,
      },
    });

    const averagePrice = averagePriceResult._avg.price || 0;

    const upcomingDeadlines = await prisma.order.count({
      where: {
        ...where,
        deadline: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: {
          not: OrderStatus.DONE,
        },
      },
    });

    return {
      byStatus: {
        pending,
        inProgress,
        done,
      },
      byType: {
        sewing,
        repair,
      },
      totalRevenue,
      averagePrice,
      upcomingDeadlines,
    };
  }

  async getUpcomingDeadlines(user: any) {
    let where: any = {
      deadline: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      status: {
        not: OrderStatus.DONE,
      },
    };

    if (user.role === "MASTER") {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
      });

      if (employee) {
        where.assignedEmployeeId = employee.id;
      } else {
        return [];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            position: true,
            email: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    return orders;
  }

  async getOverdueOrders(user: any) {
    let where: any = {
      deadline: {
        lt: new Date(),
      },
      status: {
        not: OrderStatus.DONE,
      },
    };

    if (user.role === "MASTER") {
      const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
      });

      if (employee) {
        where.assignedEmployeeId = employee.id;
      } else {
        return [];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            position: true,
            email: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    return orders;
  }
}
