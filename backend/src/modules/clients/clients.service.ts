import { prisma } from "../../server.js";
import { AppError } from "../../middlewares/errorHandler.js";
import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponse,
  ClientWithStats,
  ClientFilterParams,
} from "./clients.types.js";
import { PaginatedResponse } from "../../types/common.types.js";

export class ClientsService {
  async createClient(data: CreateClientDto): Promise<ClientResponse> {
    const existingClient = await prisma.client.findFirst({
      where: { phone: data.phone },
    });

    if (existingClient) {
      throw new AppError("Client with this phone already exists", 409);
    }

    if (data.email) {
      const existingEmail = await prisma.client.findFirst({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new AppError("Client with this email already exists", 409);
      }
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
      },
    });

    return client;
  }

  async getClients(
    params: ClientFilterParams,
  ): Promise<PaginatedResponse<ClientWithStats>> {
    const { search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClientById(id: number): Promise<ClientWithStats> {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    return client;
  }

  async getClientWithOrders(id: number) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            assignedEmployee: {
              select: {
                id: true,
                name: true,
                position: true,
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

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    return client;
  }

  async updateClient(
    id: number,
    data: UpdateClientDto,
  ): Promise<ClientResponse> {
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new AppError("Client not found", 404);
    }

    if (data.phone) {
      const phoneExists = await prisma.client.findFirst({
        where: {
          phone: data.phone,
          NOT: { id },
        },
      });

      if (phoneExists) {
        throw new AppError("Client with this phone already exists", 409);
      }
    }

    if (data.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new AppError("Client with this email already exists", 409);
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone && { phone: data.phone }),
      },
    });

    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    if (client._count.orders > 0) {
      throw new AppError(
        "Cannot delete client with existing orders. Delete orders first or contact administrator.",
        400,
      );
    }

    await prisma.client.delete({
      where: { id },
    });
  }

  async getClientStats(id: number) {
    const client = await prisma.client.findUnique({
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

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    const totalOrders = client.orders.length;
    const totalSpent = client.orders.reduce(
      (sum, order) => sum + Number(order.price),
      0,
    );
    const ordersByStatus = {
      pending: client.orders.filter((o) => o.status === "PENDING").length,
      inProgress: client.orders.filter((o) => o.status === "IN_PROGRESS")
        .length,
      done: client.orders.filter((o) => o.status === "DONE").length,
    };

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      stats: {
        totalOrders,
        totalSpent,
        ordersByStatus,
      },
    };
  }
}
